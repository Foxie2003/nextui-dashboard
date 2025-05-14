import React from 'react';
import {Svg} from '../../styles/svg';

export const LogoutIcon = () => {
   return (
      <Svg
         width="24"
         height="24"
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         css={{
            '& path': {
               fill: '$accents6',
            },
         }}
      >
         <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5 3h7c1.103 0 2 .897 2 2v2h-2V5H5v14h7v-2h2v2c0 1.103-.897 2-2 2H5c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2zm8.001 4L13 8.414l2.586 2.586L9 11v2l6.586 0L13 15.586 13.001 17l5-5-5-5z"
            fill="#969696"
         />
      </Svg>
   );
};
