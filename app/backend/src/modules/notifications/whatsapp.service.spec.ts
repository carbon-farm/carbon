import { WhatsAppService, cleanVariable, parseMode, toWhatsAppNumber } from './whatsapp.service';

describe('WhatsApp helpers', () => {
  it('only the exact words "log" and "live" switch it on', () => {
    expect(parseMode(undefined)).toBe('off');
    expect(parseMode('')).toBe('off');
    expect(parseMode('true')).toBe('off');
    expect(parseMode('LOG')).toBe('log');
    expect(parseMode(' live ')).toBe('live');
  });

  it('formats Indian mobile numbers for WhatsApp and refuses anything else', () => {
    expect(toWhatsAppNumber('9876543210')).toBe('919876543210');
    expect(toWhatsAppNumber('+91 98765 43210')).toBe('919876543210');
    expect(toWhatsAppNumber('12345')).toBeNull();
  });

  it('cleans template variables (no newlines, no long space runs, capped length)', () => {
    expect(cleanVariable('a\nb\tc      d')).toBe('a b c   d');
    expect(cleanVariable('x'.repeat(2000)).length).toBe(900);
  });
});

describe('WhatsAppService.sendNotice', () => {
  const user = { mobileNumber: '9876543210', whatsappOptIn: true, isActive: true, role: 'MEMBER' };
  const make = (env: Record<string, string>, found: unknown = user) => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(found) } };
    const config = { get: (k: string) => env[k] };
    return { prisma, service: new WhatsAppService(prisma as never, config as never) };
  };
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it('does nothing at all while off', async () => {
    const { service, prisma } = make({});
    global.fetch = jest.fn() as never;
    await service.sendNotice('u1', 'order.shipped', 'Shipped', 'Your order shipped');
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('log mode never calls WhatsApp', async () => {
    const { service } = make({ WHATSAPP_MODE: 'log' });
    global.fetch = jest.fn() as never;
    await service.sendNotice('u1', 'order.shipped', 'Shipped', 'Your order shipped');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('does not send to someone who has not opted in, to staff-queue notices, or to an inactive account', async () => {
    global.fetch = jest.fn() as never;
    await make({ WHATSAPP_MODE: 'live', WHATSAPP_TOKEN: 't', WHATSAPP_PHONE_NUMBER_ID: 'p' }, { ...user, whatsappOptIn: false }).service.sendNotice('u1', 'order.shipped', 'a', 'b');
    await make({ WHATSAPP_MODE: 'live', WHATSAPP_TOKEN: 't', WHATSAPP_PHONE_NUMBER_ID: 'p' }).service.sendNotice('u1', 'order.placed', 'a', 'b');
    await make({ WHATSAPP_MODE: 'live', WHATSAPP_TOKEN: 't', WHATSAPP_PHONE_NUMBER_ID: 'p' }, { ...user, isActive: false }).service.sendNotice('u1', 'order.shipped', 'a', 'b');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('live mode sends the approved template to the opted-in member', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as never;
    const { service } = make({ WHATSAPP_MODE: 'live', WHATSAPP_TOKEN: 'tok', WHATSAPP_PHONE_NUMBER_ID: '123', WHATSAPP_TEMPLATE: 'my_notice', WHATSAPP_TEMPLATE_LANG: 'en' });
    await service.sendNotice('u1', 'order.shipped', 'Your order shipped / మీ ఆర్డర్ పంపబడింది', 'ORD-1 is on its way');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/123/messages');
    expect(init.headers.Authorization).toBe('Bearer tok');
    const sent = JSON.parse(init.body);
    expect(sent.to).toBe('919876543210');
    expect(sent.template.name).toBe('my_notice');
    expect(sent.template.language.code).toBe('en');
    expect(sent.template.components[0].parameters.map((p: { text: string }) => p.text)).toEqual(['Your order shipped / మీ ఆర్డర్ పంపబడింది', 'ORD-1 is on its way']);
  });

  it('never throws when WhatsApp or the network fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as never;
    const { service } = make({ WHATSAPP_MODE: 'live', WHATSAPP_TOKEN: 't', WHATSAPP_PHONE_NUMBER_ID: 'p' });
    await expect(service.sendNotice('u1', 'order.shipped', 'a', 'b')).resolves.toBeUndefined();
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400, text: async () => 'bad template' }) as never;
    await expect(service.sendNotice('u1', 'order.shipped', 'a', 'b')).resolves.toBeUndefined();
  });

  it('live mode without credentials sends nothing', async () => {
    global.fetch = jest.fn() as never;
    await make({ WHATSAPP_MODE: 'live' }).service.sendNotice('u1', 'order.shipped', 'a', 'b');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
