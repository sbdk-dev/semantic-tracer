/**
 * PostHog Hook
 *
 * Provides event tracking functionality for performance monitoring.
 */

import { useEffect } from 'react';
import posthog from 'posthog-js';

// Initialize PostHog
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

let initialized = false;

export function initializePostHog() {
  if (initialized || !POSTHOG_KEY) {
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false, // We'll manually capture events for better control
  });

  initialized = true;
}

export function usePostHog() {
  useEffect(() => {
    initializePostHog();
  }, []);

  return {
    trackEvent: (eventName: string, properties?: Record<string, any>) => {
      if (!initialized) return;
      posthog.capture(eventName, properties);
    },
    trackPerformance: (metric: string, value: number, properties?: Record<string, any>) => {
      if (!initialized) return;
      posthog.capture('performance_metric', {
        metric,
        value,
        ...properties,
      });
    },
  };
}

/**
 * Track diagram-related events
 */
export function trackDiagramEvent(
  event: string,
  properties?: Record<string, any>
) {
  if (!initialized) return;
  posthog.capture(`diagram_${event}`, properties);
}

/**
 * Track performance metrics
 */
export interface PerformanceMetrics {
  renderTime?: number;
  layoutTime?: number;
  generationTime?: number;
  interactionTime?: number;
  nodeCount?: number;
  edgeCount?: number;
  fps?: number;
  memoryUsed?: number;
}

export function trackPerformanceMetrics(
  operation: string,
  metrics: PerformanceMetrics
) {
  if (!initialized) return;

  posthog.capture('performance', {
    operation,
    ...metrics,
    timestamp: Date.now(),
  });
}

/**
 * Start a performance timer
 */
export function startPerformanceTimer(label: string): () => number {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    trackPerformanceMetrics(label, { renderTime: duration });
    return duration;
  };
}

/**
 * Track user actions
 */
export function trackUserAction(
  action: string,
  properties?: Record<string, any>
) {
  if (!initialized) return;
  posthog.capture(`user_action_${action}`, properties);
}

/**
 * Track errors
 */
export function trackError(
  error: Error,
  context?: Record<string, any>
) {
  if (!initialized) return;

  posthog.capture('error', {
    errorMessage: error.message,
    errorStack: error.stack,
    ...context,
  });
}
