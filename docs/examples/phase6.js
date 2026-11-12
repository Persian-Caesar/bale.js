// مدیریت گروه

// ارتقای کاربر به ادمین
await client.groups.promote(chatId, userId, {
  can_delete_messages: true,
  can_invite_users: true,
  can_pin_messages: true,
});

// مسدود کردن کاربر
await client.groups.ban(chatId, userId);

// ساخت لینک دعوت با محدودیت
const link = await client.groups.createInviteLink(chatId, {
  member_limit: 50,
  expire_date: Math.floor(Date.now() / 1000) + 86400,
});


///////////////////////////////////////////////////////////////////////////

// پرداخت

import { InvoiceBuilder } from '@persian-caesar/bale.js';

const invoice = new InvoiceBuilder()
  .setTitle('اشتراک ویژه')
  .setDescription('دسترسی یک‌ماهه به امکانات ویژه')
  .setPayload('sub_1month')
  .setProviderToken('YOUR_PROVIDER_TOKEN')
  .setCurrency('IRR')
  .addPrice('اشتراک یک‌ماهه', 50000)
  .requireName()
  .build();

await client.payments.sendInvoice(chatId, invoice);


///////////////////////////////////////////////////////////////////////////

// پاسخ به CallbackQuery

client.on('callbackQuery', async (query) => {
  await query.answer('عملیات انجام شد!', true);
  if (query.message) {
    await query.editMessage('متن جدید پس از کلیک');
  }
});


///////////////////////////////////////////////////////////////////////////

// مینی‌اپ

// ساخت دکمهٔ مینی‌اپ
import { InlineKeyboardBuilder } from '@persian-caesar/bale.js';
const keyboard = new InlineKeyboardBuilder()
  .addButton('باز کردن فروشگاه', { web_app: { url: 'https://shop.example.com' } })
  .build();

// دریافت داده از مینی‌اپ
client.on('webAppData', (data) => {
  console.log('داده دریافتی:', data.data);
});