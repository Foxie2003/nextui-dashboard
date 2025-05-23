import React from "react";

interface Props {
  size?: number;
  fill?: string;
  width?: number;
  height?: number;
}

export const SearchIcon = ({
  size,
  fill,
  width = 24,
  height = 24,
  ...props
}: Props) => {
  return (
    <svg
      fill="none"
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M22 22L20 20"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};
