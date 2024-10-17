import {
  Button,
  Container,
  Flex,
  Grid,
  Loader,
  Tabs,
  Text,
} from "@mantine/core";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import classes from "../styles/Departmentmodule.module.css";
import BrowAnnoStaticDisplay from "./BrowAnnoStaticDisplay";

function BrowseAnnouncements() {
  const [activeTab, setActiveTab] = useState("0");
  const tabsListRef = useRef(null);

  // Conditionally add 'Make Announcements' tab based on user role
  const tabItems = [
    { title: "All" },
    { title: "CSE" },
    { title: "ECE" },
    { title: "ME" },
    { title: "SM" },
  ];

  const handleTabChange = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(+activeTab + 1, tabItems.length - 1)
        : Math.max(+activeTab - 1, 0);
    setActiveTab(String(newIndex));
    tabsListRef.current.scrollBy({
      left: direction === "next" ? 50 : -50,
      behavior: "smooth",
    });
  };

  // Function to render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "0":
        return <BrowAnnoStaticDisplay department="All" />;
      case "1":
        return <BrowAnnoStaticDisplay department="CSE" />;
      case "2":
        return <BrowAnnoStaticDisplay department="ECE" />;
      case "3":
        return <BrowAnnoStaticDisplay department="ME" />;
      case "4":
        return <BrowAnnoStaticDisplay department="SM" />;
      default:
        return <Loader />;
    }
  };

  return (
    <>
      {/* Navbar contents */}
      <div
        style={{
          display: "flex",
          justifyContent: "center", // Centers horizontally
          height: "auto", // Adjust height based on content
        }}
      >
        <h1>View Department-wise Announcemets</h1>
      </div>

      <Flex justify="space-between" align="center">
        <Flex justify="flex-start" align="center" gap="1rem" mt="0.1rem">
          <Button
            onClick={() => handleTabChange("prev")}
            variant="default"
            p={0}
            style={{ border: "none" }}
          >
            <CaretCircleLeft
              className={classes.fusionCaretCircleIcon}
              weight="light"
            />
          </Button>

          <div className={classes.fusionTabsContainer} ref={tabsListRef}>
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List style={{ display: "flex", flexWrap: "nowrap" }}>
                {tabItems.map((item, index) => (
                  <Tabs.Tab
                    value={String(index)}
                    key={index}
                    className={
                      activeTab === String(index)
                        ? classes.fusionActiveRecentTab
                        : ""
                    }
                  >
                    <Flex gap="4px">
                      <Text>{item.title}</Text>
                    </Flex>
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
          </div>

          <Button
            onClick={() => handleTabChange("next")}
            variant="default"
            p={0}
            style={{ border: "none" }}
          >
            <CaretCircleRight
              className={classes.fusionCaretCircleIcon}
              weight="light"
            />
          </Button>
        </Flex>
      </Flex>

      {/* Main content */}
      <Grid mt="xl">
        <Container py="xl">{renderTabContent()}</Container>
      </Grid>
    </>
  );
}

export default BrowseAnnouncements;
