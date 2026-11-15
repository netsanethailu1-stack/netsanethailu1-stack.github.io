# Mahiber: Share, Equb and Iddir

A record book for shared expenses (Share), equb and iddir groups. Version 1 keeps
everything on one phone and works offline. It never holds or moves money.

## Files

- `index.html`: the whole app (screens, logic, English and Amharic text)
- `manifest.webmanifest`, `sw.js`: make it installable and usable offline
- `icon.svg`: the logo, six members seated around a gold coin, like an equb circle or a
  mesob. `icon-maskable.svg` is the full-bleed version Android crops to a circle or
  squircle. The `icon-*.png` files are made from these two (192 and 512 px for the manifest
  and Google Play, 180 px for iPhone). If you change the SVG, export the PNGs again.

## Where it is hosted

The app is published with GitHub Pages at https://netsanethailu1-stack.github.io/ (repository
`netsanethailu1-stack.github.io`). After changing a file, publish it with:

    powershell -ExecutionPolicy Bypass -File .\publish.ps1

It uploads only the site's files that changed (not `tests/` or the script itself) and needs
the GitHub CLI signed in once (`gh auth login`). A change shows up after about a minute; on
a phone that already has the app, it appears the second time the app is opened.

## Try it on a phone

1. Upload all these files to any HTTPS static host (your own domain, GitHub Pages, Netlify).
2. Open the address in Chrome on Android.
3. Chrome menu, then "Add to Home screen". It then opens like an app and works offline.

HTTPS is required: the app lock and offline mode do not work on plain http.

## The Android app

`android/Mahiber.apk` is the installable Android app (package ID `app.mahiber.records`,
version 1.0.0.0), built with PWABuilder. It is a thin wrapper that opens the hosted site
full screen, so publishing a change to the site updates the app too; a new APK is only
needed if the name, icon, colours or address change.

Install it on an Android phone:

1. On the phone open https://netsanethailu1-stack.github.io/android/Mahiber.apk in Chrome.
2. Open the downloaded file. Android asks to allow installing from Chrome; allow it once.
3. Open Mahiber from the app drawer. The first launch needs internet; after that it works offline.

`.well-known/assetlinks.json` on the site tells Android that the app and the site belong
together. Without it the app shows a browser address bar at the top.

The signing key is NOT in this folder. It is in `Documents\Mahiber-signing-key` on the PC
(`signing.keystore` and `signing-key-info.txt` with its passwords). Back that folder up
somewhere private and never share or publish it: whoever has it can release updates as
this app, and without it you cannot update the app.

iPhone has no APK. On iOS open the site in Safari, tap Share, then "Add to Home Screen".

## Put it on Google Play

`android/Mahiber.aab` is the bundle Google Play wants. Steps 1 to 4 below are done; what is
left is a Google Play developer account (one-time 25 USD fee) and step 5. If you turn on
Play App Signing, Google signs the app with its own key: copy the SHA-256 fingerprint from
Play Console (Setup, App signing) into `.well-known/assetlinks.json` as a second
fingerprint and publish again, or the address bar comes back.

Google Play accepts a web app wrapped as a Trusted Web Activity.

1. Host the app on your own HTTPS domain.
2. The PNG icons Play needs are already in the manifest. For the store listing icon,
   upload `icon-maskable-512.png`.
3. Generate the Android package with PWABuilder or Bubblewrap.
4. Publish the Digital Asset Links file they give you at `/.well-known/assetlinks.json`.
5. Upload the package in Play Console as a free app.

## How Share works

1. On first launch the app asks only for your name. Your Telebirr number and bank account
   are optional until you send your first payment request, when you need at least one.
2. Create a share with the total you paid and the people in it. Choose people from
   Contacts inside the form, or type "name, phone" on each line.
3. The app divides the total. For each person, "Request" builds a message with their
   amount and your Telebirr and bank details, to send by SMS or another app.
4. They pay you directly with whichever they prefer. You record it with "Mark paid"
   and the transaction number.

Two ways to load contacts:

- "Import contacts file (.vcf)" works everywhere. In the phone's Contacts app choose
  Export to file, then select that file once. The list stays in the app.
- "Pick from phone" appears only in Chrome on Android when the app is hosted on HTTPS.

## Summaries members can check

1. In any group the organiser taps "Send summary to members" and sends the message, for
   example to the group's Telegram chat. It has the figures in plain text, a short record
   fingerprint, and a code with the group's own history.
2. A member opens Mahiber, taps "Check a summary" on the home screen and pastes the whole
   message. Their app works out the figures again from the history itself, checks every
   equb draw against its sealed code, and keeps the copy on the phone.
3. When the next summary arrives, the app compares it with the kept copy. New entries are
   fine; if any earlier entry was changed or removed, it shows a warning with the entry number
   and does not replace the kept copy.
4. Members can compare the fingerprint with each other. If everyone sees the same one,
   everyone got the same record.

The code leaves out phone numbers and other groups. The seed of a draw that has not happened
yet is also left out, so members cannot use it to choose the winning number. The code is
compressed: a few hundred characters for a new group, growing with its history. That fits a
chat message but often not a single SMS.

## What version 1 does not do yet

- No accounts and no sync: each phone has its own records. Members see results when the
  organiser sends them a summary (see "Summaries members can check" below).
- No treasurer confirmation step, because there is only one phone.
- No premium plan or payment. That is sold on a website later, not inside the app.
- Languages: English and Amharic. The Amharic text needs a native-speaker review.

## Security notes

- Optional app PIN. With it on, records are encrypted on the phone (AES-256-GCM,
  key from the PIN with PBKDF2). A short PIN can be guessed by someone who copies
  the phone's storage, so use 6 digits or more.
- The history is the record. Every change (an expense, a payment, a draw) is saved as an
  event in a hash-chained ledger, and the groups are rebuilt from it each time the app opens.
  Nothing else is stored, so changing any figure breaks the chain and "Check the record"
  names the entry. History text is written from each event in the current language.
  Someone with full control of the phone could still rebuild the whole chain; server-side
  copies fix that later, and the same events are what a future sync would send.
- Records from the first version are converted automatically on first launch or unlock:
  old history entries are kept as they were (their hashes still check) and one
  "moved to the new history format" entry per group records its state. The old record is
  also kept on the phone under `mahiber.v1.before-v2`. Old backups still restore.
- The equb draw publishes a sealed code (SHA-256 of a random seed) before the draw.
  Send it to members first. At the draw the members choose a number together, and the
  winner comes from SHA-256(seed | round | members' number). The organiser cannot know the
  number when sealing the code, so trying seeds until a friend wins does not work. The check
  shows the sealed code, the members' number and the opened seed. Draws made before this
  change have no members' number and are still checked the old way.
- Browsers can clear site storage. Export a backup regularly (Settings, Backup). With app
  lock on, the backup is locked with your PIN and needs it to restore. Without app lock it
  is plain text.
- A restored backup is checked field by field (IDs, amounts, dates, codes) and refused if
  anything does not look like data the app wrote. Stored values are also escaped when shown.

## Tests

`node tests/core.test.js index.html` checks the split, settlement, draw, history,
calendar, encryption, backup-check and member-summary logic (needs Node.js, for example `winget install OpenJS.NodeJS.LTS`).
`tests/smoke.py` drives the app in Chrome end to end with Playwright; it expects the app on
`http://localhost:8765` and a Linux Chrome path, so adjust `executable_path` on Windows.

The offline cache (`sw.js`) serves the cached app and refreshes it in the background, so a
new version appears on the next launch. Change `CACHE` only when you remove or rename a file.
