import React from "react";
import { Svg } from "../../styles/svg";

export const PaymentsIcon = () => {
  return (
    <Svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      css={{
        "& path": {
          fill: "$accents6",
        },
      }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.5 3.5L18 2L16.5 3.5L15 2L13.5 3.5L12 2L10.5 3.5L9 2L7.5 3.5L6 2L4.5 3.5L3 2V22L4.5 20.5L6 22L7.5 20.5L9 22L10.5 20.5L12 22L13.5 20.5L15 22L16.5 20.5L18 22L19.5 20.5L21 22V2L19.5 3.5ZM19 19.09H5V4.91H19V19.09ZM6 15H18V17H6V15ZM18 13H6V11H18V13ZM6 9H18V7H6V9Z"
        fill="#969696"
      />
    </Svg>
  );
};
