/**
 * Event Processor Schema
 * 
 * This file defines the schema for events processed by the Event Processor service.
 * It includes the base event interface and specific event types.
 */

// Base event interface
export interface BaseEvent {
  event_id: string;
  timestamp: string;
  event_type: string;
  source: string;
  version: string;
  trace_id: string;
  user_id: string;
  status: string;
  payload?: Record<string, unknown>;
  metadata?: {
    [key: string]: unknown;
  };
}

// User signup event
export interface UserSignupEvent extends BaseEvent {
  event_type: 'CustomMessage_SignUp';
  payload: {
    email: string;
    username: string;
  };
}

// User login event
export interface UserLoginEvent extends BaseEvent {
  event_type: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE';
  payload: {
    email: string;
    username: string;
    loginMethod: string;
    ipAddress?: string;
    deviceInfo?: string;
  };
}

// User profile update event
export interface UserProfileUpdateEvent extends BaseEvent {
  event_type: 'PROFILE_UPDATE';
  payload: {
    userId: string;
    updatedFields: string[];
    previousValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
  };
}

// Analytics event
export interface AnalyticsEvent extends BaseEvent {
  event_type: string;
  payload: {
    category: string;
    action: string;
    label?: string;
    value?: number;
    properties?: Record<string, unknown>;
  };
}

// System event
export interface SystemEvent extends BaseEvent {
  event_type: string;
  payload: {
    component: string;
    action: string;
    details?: Record<string, unknown>;
  };
}

// Type guards
export function isUserSignupEvent(event: BaseEvent): event is UserSignupEvent {
  return (
    event.event_type === 'CustomMessage_SignUp' &&
    'payload' in event &&
    typeof (event as UserSignupEvent).payload?.email === 'string' &&
    typeof (event as UserSignupEvent).payload?.username === 'string'
  );
}

export function isUserLoginEvent(event: BaseEvent): event is UserLoginEvent {
  return (
    (event.event_type === 'LOGIN_SUCCESS' || event.event_type === 'LOGIN_FAILURE') &&
    'payload' in event &&
    typeof (event as UserLoginEvent).payload?.email === 'string' &&
    typeof (event as UserLoginEvent).payload?.username === 'string'
  );
}

export function isUserProfileUpdateEvent(event: BaseEvent): event is UserProfileUpdateEvent {
  return (
    event.event_type === 'PROFILE_UPDATE' &&
    'payload' in event &&
    typeof (event as UserProfileUpdateEvent).payload?.userId === 'string' &&
    Array.isArray((event as UserProfileUpdateEvent).payload?.updatedFields)
  );
}

export function isAnalyticsEvent(event: BaseEvent): event is AnalyticsEvent {
  return (
    event.event_type.includes('ANALYTICS') &&
    'payload' in event &&
    typeof (event as AnalyticsEvent).payload?.category === 'string' &&
    typeof (event as AnalyticsEvent).payload?.action === 'string'
  );
}

export function isSystemEvent(event: BaseEvent): event is SystemEvent {
  return (
    !isUserSignupEvent(event) &&
    !isUserLoginEvent(event) &&
    !isUserProfileUpdateEvent(event) &&
    !isAnalyticsEvent(event) &&
    'payload' in event &&
    typeof (event as SystemEvent).payload?.component === 'string' &&
    typeof (event as SystemEvent).payload?.action === 'string'
  );
}

// Union type for all possible events
export type EventTypes = 
  | UserSignupEvent 
  | UserLoginEvent 
  | UserProfileUpdateEvent 
  | AnalyticsEvent 
  | SystemEvent;
