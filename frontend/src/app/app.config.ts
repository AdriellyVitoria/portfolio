import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { environment } from '../environments/environment';
import { provideDados } from './core/data/provide-dados';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ anchorScrolling: 'enabled' }),
    ),
    provideClientHydration(withEventReplay()),
    provideDados({
      fonte: environment.fonteDados,
      latenciaSimuladaMs: environment.latenciaSimuladaMs,
    }),
  ],
};
