import { Badge } from "@nextui-org/react";
import Link from "next/link";
import React from "react";
import { Flex } from "../styles/flex";
import { Text } from "@nextui-org/react";

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  href?: string;
  alert?: boolean;
  onClick?: () => void;
}

export const SidebarItem = ({
  title,
  icon,
  isActive,
  href,
  alert,
  onClick,
}: Props) => {
  const content = (
    <Flex
      css={{
        gap: "$6",
        width: "100%",
        minHeight: "44px",
        height: "100%",
        alignItems: "center",
        px: "$7",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        "&:active": {
          transform: "scale(0.98)",
        },
        "&:hover": {
          bg: "$accents2",
        },
        ...(isActive
          ? {
              bg: "$accents2",
              "& svg path": {
                fill: "$accents9",
              },
            }
          : {}),
      }}
      justify="between"
    >
      <Flex css={{ gap: "$6" }}>
        {icon}
        <Text
          span
          weight="normal"
          size="$base"
          css={{
            color: "$accents9",
          }}
        >
          {title}
        </Text>
      </Flex>
      {alert && (
        <Flex justify="end">
          <Badge
            isSquared
            content=""
            css={{
              minWidth: "8px",
              height: "8px",
              bg: "$red600",
            }}
          />
        </Flex>
      )}
    </Flex>
  );

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
