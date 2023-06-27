import { EmptyState, EmptyStateBody } from '@patternfly/react-core';
import InvalidObject from '@redhat-cloud-services/frontend-components/InvalidObject';
import React from 'react';

const LostPage = () => (
  <EmptyState>
    <EmptyStateBody>
      <InvalidObject />
    </EmptyStateBody>
  </EmptyState>
);

export default LostPage;
