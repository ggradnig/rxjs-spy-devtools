import { Injectable, NgZone, Provider } from '@angular/core';
import { PANEL_BACKGROUND_CONNECT, PANEL_BACKGROUND_INIT, PANEL_MESSAGE } from '@devtools/constants';
import { Message, Post } from '@devtools/interfaces';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import { fromEventPattern } from 'rxjs/observable/fromEventPattern';
import { observeOn } from 'rxjs/operators/observeOn';
import { share } from 'rxjs/operators/share';
import { enterZone } from '@app/shared/utils';
import { ChromeMockService } from './chrome-mock.service';
import { MessageListener } from './types';

export function createChromeService(ngZone: NgZone): ChromeMockService | ChromeService {
  return ((typeof chrome !== 'undefined') && chrome && chrome.devtools) ?
    new ChromeService(ngZone) :
    new ChromeMockService(ngZone);
}

@Injectable()
export class ChromeService {

  private static _posts = 0;
  public posts: Observable<Post>;
  private _backgroundConnection: chrome.runtime.Port;

  public static forRoot(): Provider {
    return { deps: [NgZone], provide: ChromeService, useFactory: createChromeService };
  }

  constructor(ngZone: NgZone) {

    const tabId = chrome.devtools.inspectedWindow.tabId;
    this._backgroundConnection = chrome.runtime.connect({ name: PANEL_BACKGROUND_CONNECT });
    this._backgroundConnection.postMessage({ postType: PANEL_BACKGROUND_INIT, tabId });

    this.posts = fromEventPattern<Post>(
      handler => this._backgroundConnection.onMessage.addListener(handler as MessageListener),
      handler => this._backgroundConnection.onMessage.removeListener(handler as MessageListener)
    ).pipe(
      observeOn(enterZone(ngZone)),
      share()
    );
  }

  post(message: Message): Post {
    const post = { ...message, postId: (++ChromeService._posts).toString(), postType: PANEL_MESSAGE };
    this._backgroundConnection.postMessage(post);
    return post;
  }
}
