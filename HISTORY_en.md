> Это английская версия, см. [HISTORY.md](HISTORY.md) для русской.

### v0.0.1.6
    * Added "feedback" for the main actions. Now, after clicking a button on the notification or using keyboard shortcuts, a new notification will inform of a result of the performed action:
      * "Add track to playlist" - "Successfully added track to playlist" or "Track already in your playlist";
      * "I like it!" - "Thank you for rewarding a DJ's hard work!";
      * "Stop / Play" - "Playback started/stopped/resumed";
      * "Mute / Unmute" - "Muted/Unmuted".
> Be advised that appearance of the notification for "Add track to playlist" and "I like it!" sometimes can be delayed because of technical reasons beyond `PoziTone`'s control.

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
      * "Add track to playlist" - Alt+Shift+D;
      * "Stop / Play" - Alt+Shift+P;
      * "Mute / Unmute" - Alt+Shift+M;
      * "Show notification" - Alt+Shift+Q.
    * Detailed README.md file.

### v0.0.1.0
    * First beta of PoziTone.