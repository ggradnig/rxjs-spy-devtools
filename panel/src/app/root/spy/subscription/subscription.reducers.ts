import { SubscriptionSnapshot } from '@devtools/interfaces';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeatureSelector } from '@ngrx/store';
import { on, reducer } from 'ts-action';
import { BroadcastNotification, Connect, Disconnect, SnapshotFulfilled } from '../service/service.actions';

export type SubscriptionState = EntityState<Partial<SubscriptionSnapshot>>;

export const subscriptionAdapter = createEntityAdapter<Partial<SubscriptionSnapshot>>({
  selectId: entity => entity.id
});

export const subscriptionReducer = reducer<SubscriptionState>([

  on(BroadcastNotification, (state, { notification }) => {
    const id = notification.subscription.id;
    const previous = state.entities[id];
    const changes = {
      ...notification.subscription,
      tick: notification.tick
    };
    return previous ?
      subscriptionAdapter.updateOne({ id, changes }, state) :
      subscriptionAdapter.addOne(changes, state);
  }),

  on(Connect, () => subscriptionAdapter.getInitialState({})),

  on(Disconnect, () => subscriptionAdapter.getInitialState({})),

  on(SnapshotFulfilled, (state, { snapshot }) =>
    subscriptionAdapter.addMany(snapshot.subscriptions, subscriptionAdapter.getInitialState({}))
  )

], subscriptionAdapter.getInitialState({}));

export const selectSubscriptionState = createFeatureSelector<SubscriptionState>('subscriptions');
export const {
  selectIds: selectSubscriptionIds,
  selectEntities: selectSubscriptionEntities,
  selectAll: selectAllSubscriptions
} = subscriptionAdapter.getSelectors(selectSubscriptionState);

export const subscriptionIdsReducer = reducer<string[]>([

  on(BroadcastNotification, (state, { notification }) => {
    switch (notification.type) {
    case 'after-subscribe':
      return [...state, notification.subscription.id];
    case 'after-unsubscribe':
      return state.filter(id => id !== notification.subscription.id);
    default:
      return state;
    }
  })

], []);
