import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Title,
  Table,
  ActionIcon,
  Tooltip,
  TextInput,
  Group,
  Modal,
  Text,
  Button,
  Pagination,
  Stack,
  Badge,
  Divider,
  useMantineTheme,
  ScrollArea,
} from "@mantine/core";
import {
  Archive,
  Eye,
  CaretUp,
  CaretDown,
  ArrowsDownUp,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import axios from "axios";
import { useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import { useMediaQuery } from "@mantine/hooks";
import View from "./ViewFile";
import {
  getFilesRoute,
  createArchiveRoute,
} from "../../../routes/filetrackingRoutes";

export default function Inboxfunc() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const token = localStorage.getItem("authToken");
  const role = useSelector((state) => state.user.role);
  const username = useSelector((state) => state.user.roll_no);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const itemsPerPage = 7;
  const theme = useMantineTheme();
  let current_module = useSelector((state) => state.module.current_module);
  current_module = current_module.split(" ").join("").toLowerCase();

  // Media query for responsive design
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  // New state for archive confirmation modal
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedArchiveFile, setSelectedArchiveFile] = useState(null);

  // Helper function to convert dates
  const convertDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  // Helper function to generate file ID
  const generateFileId = (file) => {
    return `${file.branch}-${new Date(file.upload_date).getFullYear()}-${(new Date(file.upload_date).getMonth() + 1).toString().padStart(2, "0")}-#${file.id}`;
  };

  // Fetch files on component mount
  useEffect(() => {
    const getFiles = async () => {
      try {
        const response = await axios.get(`${getFilesRoute}`, {
          params: {
            username,
            designation: role,
            src_module: current_module,
          },
          withCredentials: true,
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        console.log("Inbox: ", response.data);
        setFiles(response.data);
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    };

    getFiles();
  }, [username, role, current_module, token]);

  const handleArchive = async (fileID) => {
    try {
      await axios.post(
        `${createArchiveRoute}`,
        { file_id: fileID },
        {
          params: {
            username,
            designation: role,
            src_module: current_module,
          },
          withCredentials: true,
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      const updatedFiles = files.filter((file) => file.id !== fileID);
      setFiles(updatedFiles);
      notifications.show({
        title: "File archived",
        message: "The file has been successfully archived",
        color: "green",
      });
    } catch (err) {
      console.error("Error archiving file:", err);
    }
  };

  const handleBack = () => {
    setSelectedFile(null);
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const direction = sortConfig.direction === "asc" ? 1 : -1;
    return a[sortConfig.key] > b[sortConfig.key] ? direction : -direction;
  });

  const filteredFiles = sortedFiles.filter((file) => {
    const idString = generateFileId(file);
    return (
      file.uploader.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.sent_by_user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idString.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      convertDate(file.upload_date)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      file.sent_by_designation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handlePageJump = (e) => {
    if (e.key === "Enter") {
      const pageNumber = parseInt(pageInput, 10);
      const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
      if (
        Number.isNaN(pageNumber) ||
        pageNumber < 1 ||
        pageNumber > totalPages
      ) {
        setPageInput("");
        return;
      }
      setCurrentPage(pageNumber);
      setPageInput("");
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredFiles.length);

  // Using e.currentTarget ensures the style is applied to the ActionIcon element
  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = e.currentTarget.dataset.hoverColor;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor =
      e.currentTarget.dataset.defaultColor;
  };

  // Archive modal functions
  const openArchiveModal = (file) => {
    setSelectedArchiveFile(file);
    setShowArchiveModal(true);
  };

  const confirmArchive = () => {
    if (selectedArchiveFile) {
      handleArchive(selectedArchiveFile.id);
      setShowArchiveModal(false);
      setSelectedArchiveFile(null);
    }
  };

  // Mobile card view rendering
  const renderMobileView = () => {
    return (
      <Stack spacing="md">
        {filteredFiles
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((file, index) => (
            <Card
              key={index}
              shadow="sm"
              p="md"
              radius="md"
              withBorder
              style={{ position: "relative" }}
            >
              <Badge
                color="blue"
                variant="light"
                size="sm"
                style={{ position: "absolute", top: 10, right: 10 }}
              >
                {generateFileId(file)}
              </Badge>

              <Text weight={600} size="md" mb={6}>
                {file.subject}
              </Text>

              <Group position="apart" mt="xs" mb="xs">
                <Text size="sm">
                  <Text span weight={500}>
                    From:
                  </Text>{" "}
                  {file.sent_by_user}
                </Text>
                <Text size="sm" color="dimmed">
                  {file.sent_by_designation}
                </Text>
              </Group>

              <Divider my="xs" />

              <Group position="apart" mt="xs">
                <Text size="sm">
                  <Text span weight={500}>
                    Created by:
                  </Text>{" "}
                  {file.uploader}
                </Text>
                <Text size="sm" color="dimmed">
                  {file.uploader_designation}
                </Text>
                <Text size="sm" color="dimmed">
                  {convertDate(file.upload_date)}
                </Text>
              </Group>

              <Group position="apart" mt="md">
                <Tooltip label="View File" position="top" withArrow>
                  <Button
                    variant="light"
                    color="blue"
                    size="xs"
                    leftIcon={<Eye size="1rem" />}
                    onClick={() => setSelectedFile(file)}
                  >
                    View
                  </Button>
                </Tooltip>

                {file.uploader === username && (
                  <Tooltip label="Archive file" position="top" withArrow>
                    <Button
                      variant="light"
                      color="red"
                      size="xs"
                      leftIcon={<Archive size="1rem" />}
                      onClick={() => openArchiveModal(file)}
                    >
                      Archive
                    </Button>
                  </Tooltip>
                )}
              </Group>
            </Card>
          ))}
      </Stack>
    );
  };

  // Desktop table view rendering
  const renderDesktopView = () => {
    return (
      <ScrollArea>
        <Table
          highlightOnHover
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: "14px",
            minWidth: "900px", // Ensures horizontal scroll on smaller screens
          }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "#fff",
              zIndex: 1,
            }}
          >
            <tr style={{ backgroundColor: "#0000" }}>
              <th style={{ padding: "6px", width: "8.5%", height: "36px" }}>
                Archive
              </th>
              {["File ID", "Sent By", "Subject", "Date", "Created By"].map(
                (key) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    style={{
                      cursor: "pointer",
                      padding: "6px",
                      width: "15.5%",
                      border: "1px solid #0000",
                      alignItems: "center",
                      gap: "5px",
                      height: "36px",
                    }}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortConfig.key === key ? (
                      sortConfig.direction === "asc" ? (
                        <CaretUp size={16} />
                      ) : (
                        <CaretDown size={16} />
                      )
                    ) : (
                      <ArrowsDownUp size={16} opacity={0.6} />
                    )}
                  </th>
                ),
              )}
              <th
                style={{
                  padding: "6px",
                  width: "8.5%",
                  border: "1px solid #ddd",
                  height: "36px",
                }}
              >
                View File
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredFiles
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage,
              )
              .map((file, index) => (
                <tr key={index}>
                  <td
                    style={{
                      padding: "9px",
                      textAlign: "center",
                      border: "1px solid #ddd",
                      height: "36px",
                    }}
                  >
                    <Tooltip label="Archive file" position="top" withArrow>
                      <ActionIcon
                        variant="light"
                        color="blue"
                        className="archive-icon"
                        data-default-color="transparent"
                        data-hover-color="#ffebee"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => openArchiveModal(file)}
                        disabled={file.uploader !== username}
                      >
                        <Archive size="1.5rem" />
                      </ActionIcon>
                    </Tooltip>
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                      height: "36px",
                    }}
                  >
                    {generateFileId(file)}
                  </td>

                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                      height: "36px",
                    }}
                  >
                    {file.sent_by_user}[{file.sent_by_designation}]
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                      height: "36px",
                    }}
                  >
                    {file.subject}
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                      height: "36px",
                    }}
                  >
                    {convertDate(file.upload_date)}
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                      height: "36px",
                    }}
                  >
                    {file.uploader}[{file.uploader_designation}]
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      textAlign: "center",
                      border: "1px solid #ddd",
                      height: "36px",
                    }}
                  >
                    <Tooltip label="View File" position="top" withArrow>
                      <ActionIcon
                        variant="light"
                        color="black"
                        style={{
                          transition: "background-color 0.3s",
                          width: "2rem",
                          height: "2rem",
                        }}
                        onClick={() => setSelectedFile(file)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#E3F2FD";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        <Eye size="1rem" />
                      </ActionIcon>
                    </Tooltip>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </ScrollArea>
    );
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        backgroundColor: "#F5F7F8",
        position: "absolute",
        height: "70vh",
        width: "90vw",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {!selectedFile && (
        <Group
          position="apart"
          mb="md"
          align="center"
          style={{ flexWrap: "wrap" }}
        >
          <Title
            order={2}
            style={{
              fontSize: "24px",
            }}
          >
            Inbox
          </Title>
          <TextInput
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              marginBottom: isMobile ? "10px" : "0",
              width: isMobile ? "100%" : "auto",
            }}
            icon={<MagnifyingGlass size={16} />}
          />
        </Group>
      )}

      {selectedFile ? (
        <div style={{ overflowY: "auto", height: "100%" }}>
          <Title
            order={3}
            mb="md"
            style={{
              fontSize: isMobile ? "22px" : "26px",
              textAlign: "center",
              width: "100%",
            }}
          >
            {selectedFile.subject}
          </Title>
          <View
            onBack={handleBack}
            fileID={selectedFile.id}
            updateFiles={() =>
              setFiles(files.filter((f) => f.id !== selectedFile.id))
            }
          />
        </div>
      ) : (
        <Box
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflowY: "auto",
            height: "calc(57vh - 20px)",
            minHeight: "300px",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            marginBottom: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              marginBottom: "-1px",
              padding: isMobile ? "10px" : "0",
            }}
          >
            {isMobile ? renderMobileView() : renderDesktopView()}
          </div>
          <Group
            position="right"
            style={{
              backgroundColor: "#fff",
              padding: "8px 16px",
              borderTop: "1px solid #ddd",
              marginTop: "auto",
              minHeight: "20px",
              display: "flex",
              alignItems: "center",
              height: "58px",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: isMobile ? "center" : "flex-end",
            }}
          >
            <Text size="sm" color="dimmed">
              {`Showing ${filteredFiles.length > 0 ? startIndex + 1 : 0}-${endIndex} of ${filteredFiles.length} files`}
            </Text>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                height: "36px",
                marginLeft: isMobile ? "0" : "auto",
                flexWrap: isMobile ? "wrap" : "nowrap",
                justifyContent: isMobile ? "center" : "flex-start",
                width: isMobile ? "100%" : "auto",
              }}
            >
              <Tooltip
                label={`Enter page number (1-${Math.ceil(filteredFiles.length / itemsPerPage)})`}
                position="top"
              >
                <TextInput
                  placeholder="Page #"
                  value={pageInput}
                  onChange={(e) => {
                    setPageInput(e.target.value.replace(/[^0-9]/g, ""));
                  }}
                  onKeyPress={handlePageJump}
                  style={{
                    width: "80px",
                    textAlign: "center",
                  }}
                  size="sm"
                  type="text"
                  maxLength={3}
                />
              </Tooltip>
              <Pagination
                total={Math.ceil(filteredFiles.length / itemsPerPage)}
                value={currentPage}
                onChange={(page) => {
                  setCurrentPage(page);
                  setPageInput("");
                }}
                size="sm"
                boundaries={isMobile ? 0 : 1}
                siblings={isMobile ? 0 : 1}
                withEdges={!isMobile}
              />
            </div>
          </Group>
        </Box>
      )}
      {/* Archive Confirmation Modal */}
      <Modal
        opened={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        title={
          <Text align="center" weight={600} size="lg">
            Confirm Archive
          </Text>
        }
        centered
        size={isMobile ? "xs" : "md"}
      >
        <Text weight={600} mb="md">
          Are you sure you want to archive this file?
        </Text>
        {selectedArchiveFile && (
          <>
            <Text mb="ls">Subject: {selectedArchiveFile.subject}</Text>
            <Text mb="md">File ID: {generateFileId(selectedArchiveFile)}</Text>
          </>
        )}
        <Group justify="center" gap="xl" style={{ width: "100%" }}>
          <Button
            onClick={confirmArchive}
            color="blue"
            style={{ width: isMobile ? "100px" : "120px" }}
          >
            Confirm
          </Button>
          <Button
            onClick={() => setShowArchiveModal(false)}
            variant="outline"
            style={{ width: isMobile ? "100px" : "120px" }}
          >
            Cancel
          </Button>
        </Group>
      </Modal>
    </Card>
  );
}
