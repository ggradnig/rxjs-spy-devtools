import { Injectable } from '@angular/core';
import { MESSAGE_CONNECT, MESSAGE_DISCONNECT } from '@devtools/constants';
import { Actions, Effect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, distinct, filter, map, mapTo, mergeMap, switchMap } from 'rxjs/operators';
import { ofType } from 'ts-action-operators';
import * as ServiceActions from './service.actions';
import { SpyService } from '../spy.service';

@Injectable()
export class ServiceEffects {

  @Effect()
  public connect = this._spyService.posts.pipe(
    filter(post => post.messageType === MESSAGE_CONNECT),
    mergeMap(() => [new ServiceActions.Connect(), new ServiceActions.Snapshot()])
  );

  @Effect()
  public deckStats = this._spyService.deckStats.pipe(
    map(stats => new ServiceActions.BroadcastDeckStats(stats))
  );

  @Effect()
  public disconnect = this._spyService.posts.pipe(
    filter(post => post.messageType === MESSAGE_DISCONNECT),
    map(() => new ServiceActions.Disconnect())
  );

  @Effect()
  public notifications = this._spyService.notifications.pipe(
    map(notification => new ServiceActions.BroadcastNotification(notification))
  );

  @Effect()
  public snapshot = this._actions.pipe(
    ofType(ServiceActions.Snapshot),
    distinct(() => ServiceActions.Snapshot, this._actions.pipe(ofType({
      SnapshotFulfilled: ServiceActions.SnapshotFulfilled,
      SnapshotRejected: ServiceActions.SnapshotRejected
    }))),
    switchMap(action => this._spyService.request({ requestType: 'snapshot' }).pipe(
      map(response => response.error ?
        new ServiceActions.SnapshotRejected(response.error.toString(), action) :
        new ServiceActions.SnapshotFulfilled(response['snapshot'])
      ),
      catchError(error => of(new ServiceActions.SnapshotRejected(error.toString(), action)))
    ))
  );

  @Effect()
  public snapshotHints = this._spyService.snapshotHints.pipe(
    mapTo(new ServiceActions.Snapshot())
  );

  constructor(private _spyService: SpyService, private _actions: Actions) {}
}
