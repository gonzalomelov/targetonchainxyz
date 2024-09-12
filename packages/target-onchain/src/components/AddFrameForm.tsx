'use client';

import { FrameForm } from './FrameForm';

const AddFrameForm = () => (
  <FrameForm
    onValid={async (data) => {
      await fetch(`/api/frame`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    }}
  />
);

export { AddFrameForm };
