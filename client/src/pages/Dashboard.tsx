import React, { useEffect, useState } from "react";
import ContactGrid from "@/components/ContactGrid";
import { Flex, Input, Spinner, IconButton, Box } from "@chakra-ui/react";
import contactApi from "@/api/modules/contacts.api";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { IoPersonAddSharp, IoSearch } from "react-icons/io5";
import ContactDialog from "@/components/ContactDialog";

interface Contact {
  id: string;
  contactName: string;
  mobileNumber?: string;
  email?: string;
  user: string;
}

const Dashboard = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchData = async (query: string = "") => {
    setLoading(true);
    try {
      const res = await contactApi.getAll(query);

      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.status === "success" && res.data) {
        setContacts(res.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSearch = () => {
    fetchData(searchTerm); // Fetch contacts based on the search term
  };

  const handleDelete = async (contactId: string) => {
    try {
      const res = await contactApi.delete(contactId);
      if (res.err) {
        toast.error(res.err.message);
      } else {
        setContacts((prevContacts) =>
          prevContacts.filter((contact) => contact.id !== contactId)
        );
        toast.success("Contact deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete contact", error);
    }
  };

  const handleSaveContact = async (values: {
    name: string;
    email: string;
    phone: string;
  }) => {
    const contactData = {
      contactName: values.name,
      mobileNumber: values.phone,
      email: values.email,
    };

    try {
      const res = await contactApi.create(contactData);

      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.status === "success") {
        setContacts((prevContacts) => [...prevContacts, res.data] as Contact[]);
        toast.success("Contact added successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleUpdateContact = async (values: {
    name: string;
    email: string;
    phone: string;
    contactId: string;
  }) => {
    const { contactId, name, phone, email } = values;
    const contactData = {
      contactName: name,
      mobileNumber: phone,
      email: email,
    };

    try {
      const res = await contactApi.update(contactId, contactData);

      if (res.status === "error") {
        toast.error(res.err?.message || "Something went wrong");
      } else if (res.status === "success") {
        setContacts(
          (prevContacts) =>
            prevContacts.map((contact) =>
              contact.id === contactId ? res.data : contact
            ) as Contact[]
        );

        toast.success("Contact updated successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (searchTerm === "") {
      fetchData();
    }
  }, [searchTerm]);

  return (
    <Flex direction="column" p={4} alignItems="center" gap={6} w="100%" mt={4}>
      {/* Search and Add Contact Section */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="center"
        mb={4}
        width={{ base: "85%", sm: "70%", md: "60%" }}
        gapY={2}
      >
        {/* Search Input */}
        <Flex
          direction="row"
          width={{ base: "100%", md: "70%" }}
          align="center"
          mb={{ base: 4, md: 0 }}
        >
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            flex="1"
            mr={4}
          />
          <IconButton
            aria-label="Search"
            onClick={handleContactSearch}
            variant="subtle"
            width="auto"
          >
            <IoSearch />
          </IconButton>
        </Flex>

        {/* Add Contact Button */}
        <Box width={{ base: "100%", md: "30%" }} ml={{ base: 0, md: 4 }}>
          <ContactDialog onSave={handleSaveContact}>
            <Button colorScheme="teal" width="100%">
              <IoPersonAddSharp /> Add Contact
            </Button>
          </ContactDialog>
        </Box>
      </Flex>
      {/* Contact Grid */}
      {loading && (
        <Flex justify="center" align="center" height="60vh">
          <Spinner size="xl" />
        </Flex>
      )}
      {!loading && (
        <ContactGrid
          contacts={contacts}
          handleDeleteContact={handleDelete}
          handleUpdateContact={handleUpdateContact}
        />
      )}
    </Flex>
  );
};

export default Dashboard;
