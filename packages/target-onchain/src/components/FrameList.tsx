import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { frameSchema } from '@/models/Schema';

// import { DeleteFrameEntry } from './DeleteFrameEntry';
// import { EditableFrameEntry } from './EditableFrameEntry';

const FrameList = async () => {
  const frame = await db.select().from(frameSchema);

  logger.info('Get all frame entries');

  return (
    <div className="mt-5" data-testid="frame-list">
      {frame.map((elt) => (
        <div key={elt.id} className="mb-1 flex items-center gap-x-1">
          {/* <DeleteFrameEntry id={elt.id} /> */}

          {/* <EditableFrameEntry
            id={elt.id}
            title={elt.title}
            shop={elt.shop}
            image={elt.image}
            button={elt.button}
            matchingCriteria={elt.matchingCriteria}
          /> */}
        </div>
      ))}
    </div>
  );
};

export { FrameList };
