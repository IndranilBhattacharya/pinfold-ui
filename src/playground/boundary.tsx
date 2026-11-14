import * as React from 'react';
import { defineAlert } from '@pinfold/react/alert';
import { defineSkeleton } from '@pinfold/react/skeleton';

const Crashed = defineAlert({ tone: 'danger', variant: 'soft' });
const Loading = defineSkeleton({ animation: 'shimmer' });

/**
 * A component page that throws shows an error card with the component's name and a Retry button;
 * the side navigation and every other page keep working.
 */
export class PageBoundary extends React.Component<{ name: string; children: React.ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidUpdate(prev: { name: string }) {
    // Another page: start clean.
    if (prev.name !== this.props.name && this.state.error) this.setState({ error: null });
  }
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <Crashed
        title={`The ${this.props.name} page stopped working`}
        description={error.message}
        actions={[{ label: 'Retry', onClick: () => this.setState({ error: null }) }]}
      />
    );
  }
}

/** While a page's code loads: the shape of a playground (controls beside a preview). */
export function PageLoading() {
  return (
    <div className="dx-play" aria-busy="true" aria-label="Loading the playground">
      <Loading variant="text" lines={6} />
      <Loading variant="rect" dimensions={{ height: 320 }} />
    </div>
  );
}
