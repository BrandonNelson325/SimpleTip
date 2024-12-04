import { Application } from '@nativescript/core';
import { Screen } from '@nativescript/core/platform';

// Force portrait orientation
Screen.orientation = 'portrait';

Application.run({ moduleName: 'app-root' });