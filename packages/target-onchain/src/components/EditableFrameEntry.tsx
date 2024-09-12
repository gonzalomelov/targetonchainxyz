// 'use client';

// import { useState } from 'react';
// import type { z } from 'zod';

// import type { MatchingCriteriaEnumSchema } from '@/validations/FrameValidation';

// import { FrameForm } from './FrameForm';

// const EditableFrameEntry = (props: {
//   id: number;
//   title: string;
//   shop: string;
//   image: string;
//   button: string;
//   matchingCriteria: z.infer<typeof MatchingCriteriaEnumSchema>;
// }) => {
//   const [isEditing, setIsEditing] = useState(false);

//   const handleEdit = () => {
//     setIsEditing((value) => !value);
//   };

//   return (
//     <>
//       <button
//         type="button"
//         aria-label="edit"
//         onClick={() => {
//           handleEdit();
//         }}
//       >
//         <svg
//           className="size-6 stroke-current"
//           fill="none"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           viewBox="0 0 24 24"
//         >
//           <path stroke="none" d="M0 0h24v24H0z" />
//           <path d="M4 20h4L18.5 9.5a1.5 1.5 0 0 0-4-4L4 16v4M13.5 6.5l4 4" />
//         </svg>
//       </button>

//       <div className="ml-1 grow">
//         {isEditing ? (
//           <FrameForm
//             edit
//             id={props.id}
//             defaultValues={{
//               title: props.title,
//               shop: props.shop,
//               image: props.image,
//               button: props.button,
//               matchingCriteria: props.matchingCriteria,
//             }}
//             onValid={async (data) => {
//               await fetch(`/api/frame`, {
//                 method: 'PUT',
//                 headers: {
//                   'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                   id: props.id,
//                   ...data,
//                 }),
//               });

//               setIsEditing(false);
//             }}
//           />
//         ) : (
//           <>
//             <span className="text-gray-500">{props.title}:</span>{' '}
//             <span className="text-gray-800">{props.shop}</span>
//           </>
//         )}
//       </div>
//     </>
//   );
// };

// export { EditableFrameEntry };
