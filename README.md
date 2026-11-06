<div align="center">

<img src=".github/assets/logo.png" width="170" alt="HotShot logo">

# HotShot

**Fire your files. No internet needed.**

**فایل‌هات رو شلیک کن. اینترنت لازم نیست.**

A Telegram-style chat for moving files between your Android phone and Windows PC, over nothing but your phone's hotspot.

[![Download](https://img.shields.io/badge/Download-APK%20%26%20EXE-0b74ec?style=for-the-badge)](https://github.com/Mohammad13854224/HotShot/releases/latest)
[![Build](https://img.shields.io/github/actions/workflow/status/Mohammad13854224/HotShot/build.yml?style=for-the-badge&label=build)](https://github.com/Mohammad13854224/HotShot/actions)

[فارسی](#فارسی) · [English](#english)

</div>

<div dir="rtl">

## فارسی

### چرا HotShot؟

- **بدون اینترنت:** اینترنت گوشی را خاموش کن. فقط هات‌اسپات لازم است و هیچ داده‌ای از دستگاه‌های خودت بیرون نمی‌رود.
- **چند گفتگوی جدا:** هر گفتگو نام خودش و پوشه‌ی ذخیره‌ی خودش را روی هر دو دستگاه دارد.
- **همگام و زنده:** هر پیام یا تغییری همان لحظه روی دستگاه دیگر دیده می‌شود و برنامه فقط وقتی چیزی تغییر کند به‌روز می‌شود.
- **بدون سقف سرعت:** فایل‌ها خام و مستقیم در پوشه‌ی گفتگو نوشته می‌شوند. سرعت را وای‌فای گوشی تعیین می‌کند، نه برنامه.
- **امن:** همه‌ی ارتباط‌ها با TLS رمز می‌شوند. گوشی فقط با کد یک‌بارمصرف جفت می‌شود و بعد از آن فقط به گواهی همان کامپیوتر اعتماد می‌کند.
- **ادامه بعد از قطعی:** اگر ارتباط قطع شود، انتقال از همان‌جا ادامه پیدا می‌کند.
- **دو زبان و دو تم:** فارسی راست‌به‌چپ و انگلیسی چپ‌به‌راست، با تم روز و شب.

### نصب

از [صفحه‌ی دانلود](https://github.com/Mohammad13854224/HotShot/releases/latest) این دو فایل را بگیر:

- `HotShot.exe` روی کامپیوتر: نصب نمی‌خواهد و داده‌هایش در پوشه‌ی `data` کنار خودش می‌ماند.
- `HotShot.apk` روی گوشی: نسخه‌های بعدی روی همین نسخه نصب می‌شوند و داده‌ها می‌مانند.

### شروع

1. هات‌اسپات گوشی را روشن کن و کامپیوتر را به آن وصل کن.
2. `HotShot.exe` را باز کن. اگر ویندوز درباره‌ی فایروال پرسید، اجازه بده.
3. از منوی برنامه «اتصال گوشی» را بزن.
4. اپ گوشی را باز کن و کد ۸ رقمی را وارد کن. این کار فقط یک‌بار لازم است.

برای بیشترین سرعت، باند هات‌اسپات را روی **5GHz** بگذار و دو دستگاه را نزدیک هم نگه دار.

اندروید اجازه نمی‌دهد خود ریشه‌ی حافظه یا پوشه‌ی Download را انتخاب کنی. در پنجره‌ی انتخاب پوشه یک زیرپوشه بساز.

### چرا فایل‌ها فشرده نمی‌شوند؟

عکس، ویدیو، APK و ZIP از قبل فشرده‌اند و حجمشان کم نمی‌شود. فشرده‌سازی چنین داده‌ای روی لپ‌تاپ آزمایشی حدود ۲۴ مگابایت بر ثانیه بود، پس معمولاً انتقال را کندتر می‌کند.

</div>

## English

### Why HotShot?

- **No internet:** turn mobile data off. All it needs is the hotspot, and nothing leaves your own devices.
- **Separate chats:** each chat has its own name and its own save folder on both devices.
- **Live sync:** messages and changes show up on the other device at once, and nothing refreshes unless something changed.
- **No speed cap:** files go raw, straight into the chat's folder. Your Wi-Fi sets the speed, not the app.
- **Secure:** everything is encrypted with TLS. The phone pairs once with a one-time code and then trusts only that computer's certificate.
- **Resumes:** a dropped connection picks up where it stopped.
- **Two languages, two themes:** Persian right-to-left and English left-to-right, with day and night themes.

### Install

Get both files from the [latest release](https://github.com/Mohammad13854224/HotShot/releases/latest):

- `HotShot.exe` for the PC: portable, it keeps its data in a `data` folder next to itself.
- `HotShot.apk` for the phone: later versions install over it and keep your data.

### Getting started

1. Turn on the phone's hotspot and connect the PC to it.
2. Open `HotShot.exe`. If Windows asks about the firewall, allow it.
3. Choose **Connect phone** from the menu.
4. Open the phone app and enter the 8-digit code. You only do this once.

For the best speed, set the hotspot band to **5GHz** and keep the devices close.

Android does not let apps pick the storage root or the Download folder itself, so create a subfolder in the folder picker.

## Build

Every push to `main` runs the server tests and builds `HotShot.exe` and `HotShot.apk` in GitHub Actions. A tag like `v1.0.0` publishes both as a release.

To sign the APK with a fixed key, add two repository secrets: `SIGNING_KEY` (the key file in base64) and `SIGNING_PASSWORD`. The key never enters the repository.

The [Vazirmatn](https://github.com/rastikerdar/vazirmatn) font is used under the SIL Open Font License.

Run from source:

```bash
pip install -r desktop/requirements.txt
python desktop/hotshot.py
python tests/test_server.py
```
