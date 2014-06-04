> Это английская версия, см. [HISTORY_ru.md](HISTORY_ru.md) для русской.

### v0.0.2.10
    * Added an “About” page.
    * Added a license agreement in Russian.
    * Added a couple of recommendations for listening in a case of an empty recent tracks list.

### v0.0.2.9
    * New PoziTone logo.
    * Added PoziTone User Experience Improvement Program (voluntary participation).

### v0.0.2.8
    * Fixed: keyboard shortcuts presses logic from the previous version did not work correctly when 101.ru player was active.

### v0.0.2.7
    * Now when pressing keyboard shortcuts, PoziTone first sends a command to the latest active player. In a case when there is no active player (for example, the tab had been closed), a player (a tab with the player) opened earlier than others will get the command.

### v0.0.2.6
    * Fixed: the buttons on the notification could execute wrong action when playback is active at the same time on 101.ru and VK, and each player's set of the enabled buttons is different.

### v0.0.2.5
    * [101.ru] Fixed: the “Add track to playlist” button would show up in the notification for the stations which do not support this action.

### v0.0.2.4
    * [vk.com] Fixed: the notification wouldn't show up for not logged-in users.
    * PoziTone also works in the Yandex and Amigo browsers.
    * Updated the README file.

### v0.0.2.3.2
    * Fixed: Chrome does not allow 5 dot-separated integer version number.

### v0.0.2.3.1
    * Fixed: the notification would stay in the Chrome Notification Center when changing the address of a tab, if a background process of PoziTone was inactive at that moment.

### v0.0.2.3
    * Now when a tab with a player gets closed or when the address of the tab gets changed, the notification is not being kept in the Chrome Notification Center.

### v0.0.2.2
    * [101.ru] Fixed: the station logo wouldn't show up in the notification for not logged-in users.

### v0.0.2.1
    * Hotfix for broken buttons on the notification.
    * Correct quotes in the README.

### v0.0.2.0
    * Added support for VK's audio player (only on full version of the site - vk.com).
    * Separate settings for each player.
    * New available button – “Next track” (only for VK).
    * Now when the pop-up notification is clicked, a tab with that player will be found and activated.
    * Added a draft PoziTone API: third-party developers will be able to create the extensions for other players; those extensions will send a required information to PoziTone, and PoziTone will take care of the rest.
    * Fixed some bugs:
      * for some 101.ru's stations the logo would not show up when viewing the recent tracks list;
      * when closing one of the tabs with PoziTone injected, keyboard shortcuts would not send commands to another open tab with PoziTone.

### v0.0.1.8
    * Extension size is reduced by ~57 KB (almost a quarter of the total size) by eliminating dependency on a third-party library (jQuery).

### v0.0.1.7
    * Showing the station logo in the notification (can be disabled in PoziTone Options).
    * Fixed a bug where repeated track info was saved on a player status change.

### v0.0.1.6
    * Added “feedback” for the main actions. Now, after clicking a button on the notification or using keyboard shortcuts, a new notification will inform of a result of the performed action:
      * “Add track to playlist” - “Successfully added track to playlist” or “Track already in your playlist”;
      * “I like it!” - “Thank you for rewarding a DJ's hard work!”;
      * “Stop / Play” - “Playback started/stopped/resumed”;
      * “Mute / Unmute” - “Muted/Unmuted”.
> Be advised that appearance of the notification for “Add track to playlist” and “I like it!” sometimes can be delayed because of technical reasons beyond `PoziTone`'s control.

### v0.0.1.5
    * Saving an on air track on the page load.
    * Saving a new track information if playback was stopped before that and the notification showing when stopped is disabled.
    * Showing the notification if playback is stopped/resumed from the page (without the help of PoziTone).

### v0.0.1.4
    * Fixed a bug: list of recent tracks wouldn't show up if it had only one record.
    * Hotkeys => Keyboard shortcuts.
    * Improved English localization.

### v0.0.1.3
    * Showing the last 10 tracks information when the extension icon next to the address bar is clicked.

### v0.0.1.2
    * Process optimization.
    * Fixed some bugs:
      * sometimes after clicking a button on the notification there would be no track info on the new notification;
      * sometimes after clicking a button or pressing keyboard shortcuts the notification would appear and disappear multiple times;
      * sometimes after clicking a button or pressing keyboard shortcuts the expected action wouldn't happen.

### v0.0.1.1
    * Added keyboard shortcuts for the following actions: 
      * “Add track to playlist” - Alt+Shift+D;
      * “Stop / Play” - Alt+Shift+P;
      * “Mute / Unmute” - Alt+Shift+M;
      * “Show notification” - Alt+Shift+Q.
    * Detailed README.md file.

### v0.0.1.0
    * First beta of PoziTone.