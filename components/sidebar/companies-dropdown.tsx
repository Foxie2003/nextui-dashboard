import { Dropdown, Text } from "@nextui-org/react";
import React, { useState } from "react";
import { AcmeIcon } from "../icons/acme-icon";
import { AcmeLogo } from "../icons/acmelogo";
import { BottomIcon } from "../icons/sidebar/bottom-icon";
import { Box } from "../styles/box";
import { Flex } from "../styles/flex";

interface Cinema {
  name: string;
  location: string;
  logo: React.ReactNode;
}

export const CompaniesDropdown = () => {
  const [cinema, setCinema] = useState<Cinema>({
    name: "CGV Cinema",
    location: "Hệ thống rạp chiếu phim",
    logo: <AcmeIcon />,
  });

  return (
    <Dropdown placement="bottom-right" borderWeight={"extrabold"}>
      <Dropdown.Trigger css={{ cursor: "pointer" }}>
        <Box role="button" aria-label="Chọn rạp chiếu phim">
          <Flex align={"center"} css={{ gap: "$7" }}>
            {cinema.logo}
            <Box>
              <Text
                h3
                size={"$xl"}
                weight={"medium"}
                css={{
                  m: 0,
                  color: "$accents9",
                  lineHeight: "$lg",
                  mb: "-$5",
                }}
              >
                {cinema.name}
              </Text>
              <Text
                span
                weight={"medium"}
                size={"$xs"}
                css={{ color: "$accents8" }}
              >
                {cinema.location}
              </Text>
            </Box>
            <BottomIcon />
          </Flex>
        </Box>
      </Dropdown.Trigger>
      <Dropdown.Menu
        aria-label="Cinema Locations"
        onAction={(key) => {
          if (key === "1") {
            setCinema({
              name: "CGV Cinema - Hà Nội",
              location: "Hà Nội",
              logo: <AcmeIcon />,
            });
          }
          if (key === "2") {
            setCinema({
              name: "CGV Cinema - TP.HCM",
              location: "TP. Hồ Chí Minh",
              logo: <AcmeLogo />,
            });
          }
          if (key === "3") {
            setCinema({
              name: "CGV Cinema - Đà Nẵng",
              location: "Đà Nẵng",
              logo: <AcmeIcon />,
            });
          }
          if (key === "4") {
            setCinema({
              name: "CGV Cinema",
              location: "Hệ thống rạp chiếu phim",
              logo: <AcmeIcon />,
            });
          }
        }}
        css={{
          $$dropdownMenuWidth: "340px",
          $$dropdownItemHeight: "60px",
          "& .nextui-dropdown-item": {
            py: "$2",
            svg: {
              color: "$secondary",
              mr: "$4",
            },
            "& .nextui-dropdown-item-content": {
              w: "100%",
              fontWeight: "$semibold",
            },
          },
        }}
      >
        <Dropdown.Section title="Chọn rạp">
          <Dropdown.Item key="1" icon={<AcmeIcon />} description="Hà Nội">
            CGV Cinema - Hà Nội
          </Dropdown.Item>
          <Dropdown.Item
            key="2"
            icon={<AcmeLogo />}
            description="TP. Hồ Chí Minh"
          >
            CGV Cinema - TP.HCM
          </Dropdown.Item>
          <Dropdown.Item key="3" icon={<AcmeIcon />} description="Đà Nẵng">
            CGV Cinema - Đà Nẵng
          </Dropdown.Item>
          <Dropdown.Item key="4" icon={<AcmeIcon />} description="Tất cả rạp">
            CGV Cinema
          </Dropdown.Item>
        </Dropdown.Section>
      </Dropdown.Menu>
    </Dropdown>
  );
};
