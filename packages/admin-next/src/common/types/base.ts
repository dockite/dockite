import { RouteComponent, RouteLocation } from 'vue-router';

export interface RouterViewScopedSlot {
  route: RouteLocation;
  Component: RouteComponent;
}
