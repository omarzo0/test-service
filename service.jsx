import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
} from "@nextui-org/react";
import { showNotification } from "../../../common/headerSlice";
import {
  getBrandsList,
  getBrandCategoriesList,
  getBrandServicesList,
  getCategoryServicesList,
  createService,
  updateService,
  removeBrandService,
  unremoveBrandService,
} from "../../../../api/requests";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { HiDotsVertical } from "react-icons/hi";
import Tooltip from "@mui/material/Tooltip";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { TagsInput } from "react-tag-input-component";
import { useTranslation } from "react-i18next";

function BrandsMain() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const brandId = searchParams.get("brandId");
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [getBrandServicesListResponsObj, setGetBrandServicesListResponsObj] =
    useState([]);
  const [getBrandCategoryListResponsObj, setGetBrandCategoryListResponsObj] =
    useState([]);
  const [getBrandsListResponsObj, setGetBrandsListResponsObj] = useState([]);

  const [selectedCategoryForSearch, setSelectedCategoryForSearch] = useState();
  const [selectedBrandForSearch, setSelectedBrandForSearch] = useState(brandId);
  const [selectedTypeForSearch, setSelectedTypeForSearch] = useState("basic");

  const [selectedServicesForEdit, setSelectedServicesForEdit] = useState(null);
  const [selectedPaginationPage, setSelectedPaginationPage] = useState(1);

  const [isBrandDropDownMenuOpen, setIsBrandDropDownMenuOpen] = useState(false);
  const [
    isBrandForCreateDropDownMenuOpen,
    setIsBrandForCreateDropDownMenuOpen,
  ] = useState(false);
  const [brandDropDownSearchKeyword, setBrandDropDownSearchKeyword] =
    useState("");
  const [
    brandForCreateDropDownSearchKeyword,
    setBrandForCreateDropDownSearchKeyword,
  ] = useState("");
  const [selectedServiceForShowDetails, setSelectedServiceForShowDetails] =
    useState(null);

  const {
    isOpen: isShowDetailsOpen,
    onOpen: onShowDetailsOpen,
    onClose: onShowDetailsClose,
  } = useDisclosure();
  const renderStars = (rate) => {
    const rating = parseFloat(rate);
    const starElements = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        starElements.push(<FaStar key={i} />);
      } else if (i - 0.5 === rating) {
        starElements.push(<FaStarHalfAlt key={i} />);
      } else {
        starElements.push(<FaRegStar key={i} />);
      }
    }

    return starElements;
  };
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredServices = getBrandServicesListResponsObj.filter((service) =>
    service.title.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleServiceDetailsModalOpen = (getBrandServicesListResponsObj) => {
    setSelectedServiceForShowDetails(getBrandServicesListResponsObj);
    onShowDetailsOpen();
  };

  const brandsDropDownMenuRef = useRef(null);
  const brandsForCreateDropDownMenuRef = useRef(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        brandsDropDownMenuRef.current &&
        !brandsDropDownMenuRef.current.contains(event.target)
      ) {
        setIsBrandDropDownMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [brandsDropDownMenuRef]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        brandsForCreateDropDownMenuRef.current &&
        !brandsForCreateDropDownMenuRef.current.contains(event.target)
      ) {
        setIsBrandForCreateDropDownMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [brandsForCreateDropDownMenuRef]);
  useEffect(() => {
    fetchBrandsList(brandDropDownSearchKeyword);
  }, [brandDropDownSearchKeyword]);

  useEffect(() => {
    fetchBrandsList(brandForCreateDropDownSearchKeyword);
  }, [brandForCreateDropDownSearchKeyword]);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await getBrandServicesList(
        selectedBrandForSearch,
        selectedTypeForSearch
      );
      if (response?.data?.error) {
        dispatch(
          showNotification({ message: response.data.error.message, status: 0 })
        );
      } else {
        setGetBrandServicesListResponsObj(response.data.data);
      }
    } catch (error) {
      console.log("Failed to fetch services:", error.message);
      dispatch(
        showNotification({ message: "Failed to fetch services", status: 0 })
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedBrandForSearch]);
  useEffect(() => {
    fetchServices();
  }, [selectedBrandForSearch, selectedTypeForSearch]); // Fetch services when brand or type changes

  const handleLoadMoreBtnClick = () => {
    setSelectedPaginationPage((prevValue) => prevValue + 1);
  };

  const handleLoadLessBtnClick = () => {
    setSelectedPaginationPage((prevValue) =>
      selectedPaginationPage === 1 ? 1 : prevValue - 1
    );
  };
  const handleUnremoveServiceBtnClick = async (serviceId) => {
    setIsLoading(true);
    try {
      var response = await unremoveBrandService(serviceId);
      if (!response?.data?.error) {
        dispatch(showNotification({ message: "Service unremoved", status: 1 }));
        fetchServices();
      } else {
        dispatch(
          showNotification({
            message: `${response.data.error.message}`,
            status: 0,
          })
        );
      }
    } catch (error) {
      console.log(response.data.error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleRemoveServiceBtnClick = async (serviceId) => {
    setIsLoading(true);
    try {
      var response = await removeBrandService(serviceId);
      if (!response?.data?.error) {
        dispatch(showNotification({ message: "Service removed", status: 1 }));
        fetchServices();
      } else {
        dispatch(
          showNotification({
            message: `${response.data.error.message}`,
            status: 0,
          })
        );
      }
    } catch (error) {
      console.log(response.data.error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrandCategoryList = async (brandId) => {
    setIsLoading(true);

    try {
      var response = await getBrandCategoriesList(
        brandId || selectedBrandForSearch.id
      );
      if (!response?.data?.error) {
        setGetBrandCategoryListResponsObj(response.data.data);
      } else {
        dispatch(
          showNotification({
            message: `${response.data.error.message}`,
            status: 0,
          })
        );
      }
    } catch (error) {
      console.log(response.data.error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrandsList = async (keyword) => {
    setIsLoading(true);

    try {
      var response = await getBrandsList(keyword);
      if (!response?.data?.error) {
        setGetBrandsListResponsObj(response.data.data);
      } else {
        dispatch(
          showNotification({
            message: `${response.data.error.message}`,
            status: 0,
          })
        );
      }
    } catch (error) {
      console.log(response.data.error.message);
    } finally {
      setIsLoading(false);
    }
  };

  //##################################################################################################################################
  // Strat Create New Service
  //##################################################################################################################################

  const [createServiceFormFieldsValues, setCreateServiceFormFieldsValues] =
    useState({
      serviceImage: "",
      serviceTitleEn: "",
      serviceTitleAr: "",
      serviceDescriptionEn: "",
      serviceDescriptionAr: "",
      servicePrice: "",
      serviceDuration: "",
      serviceLateLimit: "",
      serviceIsInBranch: "",
      serviceBrandId: "",
      serviceCategoryId: "",
      serviceType: "",
      serviceIncludesEnTerm: "",
      serviceIncludesArTerm: "",
      serviceIncludesArrayEn: [],
      serviceIncludesArrayAr: [],
      serviceLocation: "",
    });

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const handleCreateClick = () => {
    onCreateOpen();
  };
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  const handleViewDetails = () => {
    onViewOpen();
  };
  const handleCreateServiceImageChange = (event) => {
    const newValues = {
      ...createServiceFormFieldsValues,
      serviceImage: event.target.files[0],
    };
    setCreateServiceFormFieldsValues(newValues);
  };
  const [isExceedingMaxLengthEn, setIsExceedingMaxLengthEn] = useState(false);
  const [isExceedingMaxLengthAr, setIsExceedingMaxLengthAr] = useState(false);
  const [
    isExceedingMaxLengthEnDescriptionEn,
    setIsExceedingMaxLengthEnDescriptionEn,
  ] = useState(false);
  const [
    isExceedingMaxLengthEnDescriptionAr,
    setIsExceedingMaxLengthEnDescriptionAr,
  ] = useState(false);
  const [isExceedingMaxLengthPrice, setIsExceedingMaxLengthPrice] =
    useState(false);
  const [isExceedingMaxLengthDuration, setIsExceedingMaxLengthDuration] =
    useState(false);
  const [isExceedingMaxLengthLateTime, setIsExceedingMaxLengthLateTime] =
    useState(false);

  const handleCreateServiceTextInputFieldChange = (fieldName, value) => {
    setCreateServiceFormFieldsValues((prevValue) => {
      const fieldsObj = { ...prevValue };
      fieldsObj[fieldName] = value;
      if (fieldName === "serviceTitleEn") {
        setIsExceedingMaxLengthEn(value.length > 30);
      } else if (fieldName === "serviceTitleAr") {
        setIsExceedingMaxLengthAr(value.length > 30);
      } else if (fieldName === "serviceDescriptionEn") {
        setIsExceedingMaxLengthEnDescriptionEn(value.length > 500);
      } else if (fieldName === "serviceDescriptionAr") {
        setIsExceedingMaxLengthEnDescriptionAr(value.length > 500);
      } else if (fieldName === "servicePrice") {
        setIsExceedingMaxLengthPrice(value.length > 10 || value.length < 1);
      } else if (fieldName === "serviceDuration") {
        setIsExceedingMaxLengthDuration(value.length > 10 || value.length < 1);
      } else if (fieldName === "serviceLateLimit") {
        setIsExceedingMaxLengthLateTime(value.length > 10 || value.length < 1);
      }
      return fieldsObj;
    });
  };

  const handleCreateServiceBtnClick = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();

    if (!createServiceFormFieldsValues.serviceCategoryId) {
      dispatch(
        showNotification({
          message: "Categoty not allowed to be empty",
          status: 0,
        })
      );
      return;
    }

    formData.append("title[en]", createServiceFormFieldsValues.serviceTitleEn);
    formData.append(
      "serviceLocation",
      createServiceFormFieldsValues.serviceLocation
    );
    formData.append("title[ar]", createServiceFormFieldsValues.serviceTitleAr);
    formData.append("image", createServiceFormFieldsValues.serviceImage);
    formData.append("price", createServiceFormFieldsValues.servicePrice);
    formData.append("duration", createServiceFormFieldsValues.serviceDuration);
    formData.append(
      "description[en]",
      createServiceFormFieldsValues.serviceDescriptionEn
    );
    formData.append(
      "description[ar]",
      createServiceFormFieldsValues.serviceDescriptionAr
    );
    formData.append(
      "lateLimit",
      createServiceFormFieldsValues.serviceLateLimit
    );
    formData.append(
      "isInBranch",
      createServiceFormFieldsValues.serviceIsInBranch
    );
    formData.append("brandId", createServiceFormFieldsValues.serviceBrandId.id);
    formData.append("type", createServiceFormFieldsValues.serviceType);

    if (createServiceFormFieldsValues.serviceIncludesArrayEn.length > 0) {
      createServiceFormFieldsValues.serviceIncludesArrayEn.forEach(
        (includeEn, index) => {
          formData.append(`includes[${index}][en]`, includeEn);
        }
      );
    }

    if (createServiceFormFieldsValues.serviceIncludesArrayAr.length > 0) {
      createServiceFormFieldsValues.serviceIncludesArrayAr.forEach(
        (includeAr, index) => {
          formData.append(`includes[${index}][ar]`, includeAr);
        }
      );
    }

    try {
      var response = await createService(
        createServiceFormFieldsValues.serviceCategoryId,
        formData
      );
      if (!response?.data?.error) {
        dispatch(showNotification({ message: "Service created", status: 1 }));
        fetchServices(createServiceFormFieldsValues.serviceBrandId.id);
        setCreateServiceFormFieldsValues({
          serviceImage: "",
          serviceTitleEn: "",
          serviceTitleAr: "",
          serviceDescriptionEn: "",
          serviceDescriptionAr: "",
          servicePrice: "",
          serviceDuration: "",
          serviceLateLimit: "",
          serviceIsInBranch: "",
          serviceBrandId: "",
          serviceCategoryId: "",
          serviceType: "",
          serviceIncludesEnTerm: "",
          serviceIncludesArTerm: "",
          serviceIncludesArrayEn: [],
          serviceIncludesArrayAr: [],
          serviceLocation: "",
        });
        onCreateClose();
      } else {
        dispatch(
          showNotification({
            message: `${response.data.error.message}`,
            status: 0,
          })
        );
      }
      fetchBrandCategoryList();
    } catch (error) {
      console.log(response.data.error.message);
    } finally {
      setIsLoading(false);
    }
  };

  //##################################################################################################################################
  // End Create New Service
  //##################################################################################################################################

  //##################################################################################################################################
  // Strat Edit New Service
  //##################################################################################################################################
  const [locations, setLocations] = useState([
    { serviceLocation: "in" },
    { serviceLocation: "out" },
    { serviceLocation: "both" },
  ]);
  const [editServiceFormFieldsValues, setEditServiceFormFieldsValues] =
    useState({
      serviceImage: "",
      serviceTitleEn: "",
      serviceTitleAr: "",
      serviceDescriptionEn: "",
      serviceDescriptionAr: "",
      servicePrice: "",
      serviceDuration: "",
      serviceLateLimit: "",

      serviceIncludesEnTerm: "",
      serviceIncludesArTerm: "",
      serviceIncludesArrayEn: [],
      serviceIncludesArrayAr: [],
      serviceLocation: "",
    });

  useEffect(() => {
    setEditServiceFormFieldsValues({
      serviceImage: "",
      serviceTitleEn: selectedServicesForEdit?.title?.en,
      serviceTitleAr: selectedServicesForEdit?.title?.ar,
      serviceDescriptionEn: selectedServicesForEdit?.description?.en,
      serviceDescriptionAr: selectedServicesForEdit?.description?.ar,
      servicePrice: selectedServicesForEdit?.price,
      serviceDuration: selectedServicesForEdit?.duration,
      serviceLateLimit: selectedServicesForEdit?.lateLimit,

      serviceLocation: selectedServicesForEdit?.serviceLocation,
      serviceIncludesEnTerm: "",
      serviceIncludesArTerm: "",
      serviceIncludesArrayEn: [],
      serviceIncludesArrayAr: [],
    });
  }, [selectedServicesForEdit]);

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const handleEditClick = (service) => {
    setSelectedServicesForEdit(service);
    onEditOpen();
  };

  const handleEditServiceImageChange = (event) => {
    const newValues = {
      ...editServiceFormFieldsValues,
      serviceImage: event.target.files[0],
    };
    setEditServiceFormFieldsValues(newValues);
  };

  const handleEditServiceTextInputFieldChange = (fieldName, value) => {
    setEditServiceFormFieldsValues((prevValue) => {
      const fieldsObj = { ...prevValue };
      fieldsObj[fieldName] = value;
      return fieldsObj;
    });
    if (fieldName === "serviceTitleEn") {
      setIsExceedingMaxLengthEn(value.length > 30);
    } else if (fieldName === "serviceTitleAr") {
      setIsExceedingMaxLengthAr(value.length > 30);
    } else if (fieldName === "serviceDescriptionEn") {
      setIsExceedingMaxLengthEnDescriptionEn(value.length > 500);
    } else if (fieldName === "serviceDescriptionAr") {
      setIsExceedingMaxLengthEnDescriptionAr(value.length > 500);
    } else if (fieldName === "servicePrice") {
      setIsExceedingMaxLengthPrice(value.length > 10 || value.length < 1);
    } else if (fieldName === "serviceDuration") {
      setIsExceedingMaxLengthDuration(value.length > 10 || value.length < 1);
    } else if (fieldName === "serviceLateLimit") {
      setIsExceedingMaxLengthLateTime(value.length > 10 || value.length < 1);
    }
  };

  const handleEditServiceBtnClick = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append(
      "serviceLocation",
      editServiceFormFieldsValues.serviceLocation
    );

    if (editServiceFormFieldsValues.serviceTitleEn)
      formData.append("title[en]", editServiceFormFieldsValues.serviceTitleEn);
    if (editServiceFormFieldsValues.serviceTitleAr)
      formData.append("title[ar]", editServiceFormFieldsValues.serviceTitleAr);
    if (editServiceFormFieldsValues.serviceImage)
      formData.append("image", editServiceFormFieldsValues.serviceImage);
    if (editServiceFormFieldsValues.servicePrice)
      formData.append("price", editServiceFormFieldsValues.servicePrice);
    if (editServiceFormFieldsValues.serviceDuration)
      formData.append("duration", editServiceFormFieldsValues.serviceDuration);
    if (editServiceFormFieldsValues.serviceDescriptionEn)
      formData.append(
        "description[en]",
        editServiceFormFieldsValues.serviceDescriptionEn
      );
    if (editServiceFormFieldsValues.serviceDescriptionAr)
      formData.append(
        "description[ar]",
        editServiceFormFieldsValues.serviceDescriptionAr
      );
    if (editServiceFormFieldsValues.serviceLateLimit)
      formData.append(
        "lateLimit",
        editServiceFormFieldsValues.serviceLateLimit
      );

    if (editServiceFormFieldsValues.serviceIncludesArrayEn.length > 0) {
      editServiceFormFieldsValues.serviceIncludesArrayEn.forEach(
        (includeEn, index) => {
          formData.append(`includes[${index}][en]`, includeEn);
        }
      );
    }

    if (editServiceFormFieldsValues.serviceIncludesArrayAr.length > 0) {
      editServiceFormFieldsValues.serviceIncludesArrayAr.forEach(
        (includeAr, index) => {
          formData.append(`includes[${index}][ar]`, includeAr);
        }
      );
    }

    try {
      var response = await updateService(selectedServicesForEdit.id, formData);
      if (!response?.data?.error) {
        dispatch(showNotification({ message: "Service Updated", status: 1 }));
        onEditClose();
        fetchServices(editServiceFormFieldsValues.serviceBrandId.id);
      } else {
        dispatch(
          showNotification({
            message: `${response.data.error.message}`,
            status: 0,
          })
        );
      }
    } catch (error) {
      console.log(response.data.error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const inclusions = Array.isArray(getBrandServicesListResponsObj.includes)
    ? getBrandServicesListResponsObj.includes
    : [];

  //##################################################################################################################################
  // End Edit New Service
  //##################################################################################################################################

  const renderContainers = () => {
    const containers = [];
    filteredServices.forEach((service, index) => {
      containers.push(
        <div
          className="serv-cont"
          key={service.id}
          style={{ position: "relative" }}
          onClick={handleViewDetails}
        >
          <div className="pen-container">
            <div className="OutlineMessagesConversationPen">
              <div>
                <Dropdown>
                  <DropdownTrigger className="dots">
                    <Button variant="">
                      <HiDotsVertical className="rounded-full top-3" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Static Actions">
                    <DropdownItem
                      className="OutlineMessagesConversationPen"
                      onClick={() => handleEditClick(service)}
                    >
                      Edit Services
                    </DropdownItem>
                    {service.deletedAt ? (
                      <DropdownItem
                        onClick={() =>
                          handleUnremoveServiceBtnClick(service.id)
                        }
                      >
                        <div className="VerBan">
                          <h1 className="">UnRemove service</h1>
                        </div>
                      </DropdownItem>
                    ) : (
                      <DropdownItem
                        onClick={() => handleRemoveServiceBtnClick(service.id)}
                      >
                        <div className="Noban">
                          <h1 className="">Remove service</h1>
                        </div>
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              className="serv-img"
              src={service.image ? service.image : "/Group 29.png"}
              alt="Service Image"
            />
            {service.deletedAt && (
              <div className="absolute inset-0 flex items-center justify-center deleted-bg bg-opacity-75 text-lg del-hover">
                <h6>Removed</h6>
              </div>
            )}
          </div>
          <div className="service-details mt-3">
            <p className="service-name">
              Title: {service.title[currentLanguage]}
            </p>
            <p className="service-price">Price: {service.price}</p>
            <b>{formatDate(service.deletedAt)}</b>
          </div>
        </div>
      );
    });
    return containers;
  };

  return (
    <form
      className="brands-main"
      onSubmit={(e) => {
        e.preventDefault();
        fetchServices();
      }}
    >
      <div className="flex items-center justify-between mt-7">
        <p className="totalserv-txt">
          Total Services:{" "}
          <span className="totalserv-num">
            {getBrandServicesListResponsObj.length}
          </span>
        </p>
        <div className="category-search flex-1 ml-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-3 px-2 rounded-lg border border-gray-300"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Dropdown for selecting service type */}
      <Dropdown>
        <DropdownTrigger>
          <Button
            auto
            className="bg-[#4b108d] text-white border border-[#4b108d] hover:bg-[#5c1e8c]"
          >
            {selectedTypeForSearch.charAt(0).toUpperCase() +
              selectedTypeForSearch.slice(1)}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Service Types"
          className="bg-white   shadow-lg"
          onAction={(key) => {
            setSelectedTypeForSearch(key);
            fetchServices();
          }}
        >
          <DropdownItem
            key="basic"
            className="hover:bg-[#f4e7f2] text-[#4b108d]"
          >
            Basic
          </DropdownItem>
          <DropdownItem
            key="package"
            className="hover:bg-[#f4e7f2] text-[#4b108d]"
          >
            Package
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {renderContainers()}
      </div>

      <div className="brands-filter" onClick={handleCreateClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="38"
          height="38"
          viewBox="0 0 38 38"
          fill="none"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10.2095 2.77085C8.78693 2.7708 7.60064 2.77076 6.65891 2.89737C5.6649 3.03102 4.76747 3.32499 4.04631 4.04615C3.32515 4.76732 3.03117 5.66475 2.89753 6.65876C2.77092 7.60048 2.77095 8.78673 2.771 10.2093V10.374C2.77095 11.7966 2.77092 12.9829 2.89753 13.9246C3.03117 14.9186 3.32515 15.816 4.04631 16.5372C4.76747 17.2584 5.6649 17.5523 6.65891 17.686C7.60064 17.8126 8.78689 17.8126 10.2095 17.8125H10.3742C11.7967 17.8126 12.983 17.8126 13.9248 17.686C14.9188 17.5523 15.8162 17.2584 16.5374 16.5372C17.2585 15.816 17.5525 14.9186 17.6861 13.9246C17.8128 12.9829 17.8127 11.7966 17.8127 10.3741V10.2094C17.8127 8.78678 17.8128 7.60048 17.6861 6.65876C17.5525 5.66475 17.2585 4.76732 16.5374 4.04615C15.8162 3.32499 14.9188 3.03102 13.9248 2.89737C12.983 2.77076 11.7968 2.7708 10.3742 2.77085H10.2095ZM5.72569 5.72553C5.93202 5.5192 6.24472 5.34943 6.97537 5.2512C7.74018 5.14837 8.76548 5.14585 10.2918 5.14585C11.8182 5.14585 12.8435 5.14837 13.6083 5.2512C14.3389 5.34943 14.6516 5.5192 14.858 5.72553C15.0643 5.93187 15.2341 6.24457 15.3323 6.97522C15.4351 7.74003 15.4377 8.76533 15.4377 10.2917C15.4377 11.818 15.4351 12.8433 15.3323 13.6081C15.2341 14.3388 15.0643 14.6515 14.858 14.8578C14.6516 15.0642 14.3389 15.2339 13.6083 15.3322C12.8435 15.435 11.8182 15.4375 10.2918 15.4375C8.76548 15.4375 7.74018 15.435 6.97537 15.3322C6.24472 15.2339 5.93202 15.0642 5.72569 14.8578C5.51935 14.6515 5.34958 14.3388 5.25135 13.6081C5.14852 12.8433 5.146 11.818 5.146 10.2917C5.146 8.76533 5.14852 7.74003 5.25135 6.97522C5.34958 6.24457 5.51935 5.93187 5.72569 5.72553Z"
            fill="white"
          />
          <path
            d="M28.896 5.54168C28.896 4.88584 28.3643 4.35418 27.7085 4.35418C27.0527 4.35418 26.521 4.88584 26.521 5.54168V9.10418H22.9585C22.3027 9.10418 21.771 9.63584 21.771 10.2917C21.771 10.9475 22.3027 11.4792 22.9585 11.4792H26.521V15.0417C26.521 15.6975 27.0527 16.2292 27.7085 16.2292C28.3643 16.2292 28.896 15.6975 28.896 15.0417V11.4792H32.4585C33.1143 11.4792 33.646 10.9475 33.646 10.2917C33.646 9.63584 33.1143 9.10418 32.4585 9.10418H28.896V5.54168Z"
            fill="white"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M27.6262 20.1875H27.7908C29.2134 20.1875 30.3997 20.1874 31.3414 20.314C32.3354 20.4477 33.2329 20.7417 33.954 21.4628C34.6752 22.184 34.9692 23.0814 35.1028 24.0754C35.2294 25.0171 35.2294 26.2034 35.2293 27.6259V27.7907C35.2294 29.2132 35.2294 30.3996 35.1028 31.3413C34.9692 32.3353 34.6752 33.2327 33.954 33.9539C33.2329 34.675 32.3354 34.969 31.3414 35.1027C30.3997 35.2293 29.2135 35.2292 27.7909 35.2292H27.6262C26.2036 35.2292 25.0173 35.2293 24.0756 35.1027C23.0816 34.969 22.1841 34.675 21.463 33.9539C20.7418 33.2327 20.4478 32.3353 20.3142 31.3413C20.1876 30.3995 20.1876 29.2133 20.1877 27.7907V27.626C20.1876 26.2034 20.1876 25.0172 20.3142 24.0754C20.4478 23.0814 20.7418 22.184 21.463 21.4628C22.1841 20.7417 23.0816 20.4477 24.0756 20.314C25.0173 20.1874 26.2036 20.1875 27.6262 20.1875ZM24.392 22.6679C23.6614 22.7661 23.3487 22.9359 23.1424 23.1422C22.936 23.3485 22.7662 23.6612 22.668 24.3919C22.5652 25.1567 22.5627 26.182 22.5627 27.7083C22.5627 29.2347 22.5652 30.26 22.668 31.0248C22.7662 31.7555 22.936 32.0682 23.1424 32.2745C23.3487 32.4808 23.6614 32.6506 24.392 32.7488C25.1568 32.8517 26.1822 32.8542 27.7085 32.8542C29.2349 32.8542 30.2602 32.8517 31.025 32.7488C31.7556 32.6506 32.0683 32.4808 32.2747 32.2745C32.481 32.0682 32.6508 31.7555 32.749 31.0248C32.8518 30.26 32.8543 29.2347 32.8543 27.7083C32.8543 26.182 32.8518 25.1567 32.749 24.3919C32.6508 23.6612 32.481 23.3485 32.2747 23.1422C32.0683 22.9359 31.7556 22.7661 31.025 22.6679C30.2602 22.565 29.2349 22.5625 27.7085 22.5625C26.1822 22.5625 25.1568 22.565 24.392 22.6679Z"
            fill="white"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10.2095 20.1875C8.78691 20.1875 7.60065 20.1874 6.65891 20.314C5.6649 20.4477 4.76747 20.7417 4.04631 21.4628C3.32515 22.184 3.03117 23.0814 2.89753 24.0754C2.77092 25.0172 2.77095 26.2034 2.771 27.626V27.7907C2.77095 29.2133 2.77092 30.3995 2.89753 31.3413C3.03117 32.3353 3.32515 33.2327 4.04631 33.9539C4.76747 34.675 5.6649 34.969 6.65891 35.1027C7.60064 35.2293 8.78689 35.2292 10.2095 35.2292H10.3742C11.7967 35.2292 12.983 35.2293 13.9248 35.1027C14.9188 34.969 15.8162 34.675 16.5374 33.9539C17.2585 33.2327 17.5525 32.3353 17.6861 31.3413C17.8128 30.3996 17.8127 29.2133 17.8127 27.7907V27.626C17.8127 26.2035 17.8128 25.0172 17.6861 24.0754C17.5525 23.0814 17.2585 22.184 16.5374 21.4628C15.8162 20.7417 14.9188 20.4477 13.9248 20.314C12.983 20.1874 11.7968 20.1875 10.3742 20.1875H10.2095ZM5.72569 23.1422C5.93202 22.9359 6.24472 22.7661 6.97537 22.6679C7.74018 22.565 8.76548 22.5625 10.2918 22.5625C11.8182 22.5625 12.8435 22.565 13.6083 22.6679C14.3389 22.7661 14.6516 22.9359 14.858 23.1422C15.0643 23.3485 15.2341 23.6612 15.3323 24.3919C15.4351 25.1567 15.4377 26.182 15.4377 27.7083C15.4377 29.2347 15.4351 30.26 15.3323 31.0248C15.2341 31.7555 15.0643 32.0682 14.858 32.2745C14.6516 32.4808 14.3389 32.6506 13.6083 32.7488C12.8435 32.8517 11.8182 32.8542 10.2918 32.8542C8.76548 32.8542 7.74018 32.8517 6.97537 32.7488C6.24472 32.6506 5.93202 32.4808 5.72569 32.2745C5.51935 32.0682 5.34958 31.7555 5.25135 31.0248C5.14852 30.26 5.146 29.2347 5.146 27.7083C5.146 26.182 5.14852 25.1567 5.25135 24.3919C5.34958 23.6612 5.51935 23.3485 5.72569 23.1422Z"
            fill="white"
          />
        </svg>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBlock: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBlock: "25px",
              background: "#4b108d",
              padding: "8px 15px",
              color: "#fff",
            }}
          >
            <span
              style={{ padding: "0 10px", fontSize: "28px", cursor: "pointer" }}
              onClick={handleLoadLessBtnClick}
            >
              &#8592;
            </span>
            <span style={{ padding: "0 10px", fontSize: "22px" }}>
              {selectedPaginationPage}
            </span>
            <span
              style={{ padding: "0 10px", fontSize: "28px", cursor: "pointer" }}
              onClick={handleLoadMoreBtnClick}
            >
              &#8594;
            </span>
          </div>
        </div>
      </div>
      <Modal
        hideCloseButton
        className="create-service-popup"
        size="4xl"
        isOpen={isCreateOpen}
        onOpenChange={onCreateClose}
      >
        <ModalContent>
          {(onClose) => (
            <div className="">
              <ModalHeader className="">
                <ModalHeader className="">
                  <div className="add-user-header">
                    <div className="provider-img">
                      <img
                        src="/Subtract21.png"
                        alt=""
                        onClick={() =>
                          document.querySelector("#service-create-file").click()
                        }
                      />
                      <p>{createServiceFormFieldsValues.serviceImage.name}</p>
                      <input
                        type="file"
                        onChange={(event) =>
                          handleCreateServiceImageChange(event)
                        }
                        id="service-create-file"
                        hidden
                      />
                    </div>
                    <div className="provider-data">
                      <h3>Create New Service</h3>
                    </div>
                  </div>
                </ModalHeader>
              </ModalHeader>

              <ModalBody>
                <div className="add-user-labels">
                  <div className="labels-names">
                    <label>
                      <input
                        required
                        placeholder="Service Title (EN)"
                        className="mnblkjj"
                        type="text"
                        value={createServiceFormFieldsValues.serviceTitleEn}
                        onChange={(e) =>
                          handleCreateServiceTextInputFieldChange(
                            "serviceTitleEn",
                            e.target.value
                          )
                        }
                        maxLength={31}
                      />
                      {isExceedingMaxLengthEn && (
                        <div className="error-message">
                          Please reduce the length to 30 characters or less.
                        </div>
                      )}
                    </label>
                    <label>
                      <input
                        required
                        placeholder="Service Title (AR)"
                        className="mnblkjj"
                        type="text"
                        value={createServiceFormFieldsValues.serviceTitleAr}
                        onChange={(e) =>
                          handleCreateServiceTextInputFieldChange(
                            "serviceTitleAr",
                            e.target.value
                          )
                        }
                      />
                      {isExceedingMaxLengthAr && (
                        <div className="error-message">
                          Please reduce the length to 30 characters or less.
                        </div>
                      )}
                    </label>

                    <label>
                      <textarea
                        required
                        placeholder="Service Description (EN)"
                        className="mnblkjj"
                        type="text"
                        value={
                          createServiceFormFieldsValues.serviceDescriptionEn
                        }
                        onChange={(e) =>
                          handleCreateServiceTextInputFieldChange(
                            "serviceDescriptionEn",
                            e.target.value
                          )
                        }
                      />
                      {isExceedingMaxLengthEnDescriptionEn && (
                        <div className="error-message">
                          Please reduce the length to 500 characters or less.
                        </div>
                      )}
                    </label>
                    <label>
                      <textarea
                        required
                        placeholder="Service Description (AR)"
                        className="mnblkjj"
                        type="text"
                        value={
                          createServiceFormFieldsValues.serviceDescriptionAr
                        }
                        onChange={(e) =>
                          handleCreateServiceTextInputFieldChange(
                            "serviceDescriptionAr",
                            e.target.value
                          )
                        }
                      />
                      {isExceedingMaxLengthEnDescriptionAr && (
                        <div className="error-message">
                          Please reduce the length to 500 characters or less.
                        </div>
                      )}
                    </label>

                    <label>
                      <input
                        required
                        placeholder="Service Price"
                        className="mnblkjj"
                        type="number"
                        value={createServiceFormFieldsValues.servicePrice}
                        onChange={(e) =>
                          handleCreateServiceTextInputFieldChange(
                            "servicePrice",
                            e.target.value
                          )
                        }
                      />
                      {isExceedingMaxLengthPrice && (
                        <div className="error-message">
                          Please reduce the length to 10 number and not less
                          than 1.
                        </div>
                      )}
                    </label>
                    <label>
                      <input
                        required
                        placeholder="Service Duration (in minutes)"
                        className="mnblkjj"
                        type="number"
                        value={createServiceFormFieldsValues.serviceDuration}
                        onChange={(e) =>
                          handleCreateServiceTextInputFieldChange(
                            "serviceDuration",
                            e.target.value
                          )
                        }
                      />
                      {isExceedingMaxLengthDuration && (
                        <div className="error-message">
                          Please reduce the length to 10 number and not less
                          than 1.
                        </div>
                      )}
                    </label>

                    <label>
                      <input
                        required
                        placeholder="Service Late Limit (In minutes)"
                        className="mnblkjj"
                        type="number"
                        value={createServiceFormFieldsValues.serviceLateLimit}
                        onChange={(e) =>
                          handleCreateServiceTextInputFieldChange(
                            "serviceLateLimit",
                            e.target.value
                          )
                        }
                      />
                      {isExceedingMaxLengthLateTime && (
                        <div className="error-message">
                          Please reduce the length to 10 number and not less
                          than 1.
                        </div>
                      )}
                    </label>
                    <label>
                      <select
                        required
                        className="mnblkjj"
                        value={createServiceFormFieldsValues.serviceType}
                        onChange={(e) =>
                          handleCreateServiceTextInputFieldChange(
                            "serviceType",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Service Type</option>
                        <option value="basic">Basic</option>
                        <option value="package">Package</option>
                      </select>
                    </label>
                    <label>
                      <div class="service-type">
                        <select
                          id="selectOption"
                          value={createServiceFormFieldsValues.serviceLocation}
                          onChange={(e) =>
                            handleCreateServiceTextInputFieldChange(
                              "serviceLocation",
                              e.target.value
                            )
                          }
                          className="mnblkjj"
                          style={{ background: "none" }}
                        >
                          <option value="">Services Location</option>
                          {locations.map((loc) => (
                            <option
                              key={loc.serviceLocation}
                              value={loc.serviceLocation}
                            >
                              {loc.serviceLocation}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>

                    <label>
                      <select
                        required
                        className="mnblkjj"
                        value={createServiceFormFieldsValues.serviceBrandId}
                        onChange={(e) =>
                          handleCreateServiceTextInputFieldChange(
                            "serviceBrandId",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select a brand</option>
                        {getBrandsListResponsObj.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name.en}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <select
                        required
                        className="mnblkjj"
                        value={createServiceFormFieldsValues.serviceCategoryId}
                        onChange={(e) =>
                          handleCreateServiceTextInputFieldChange(
                            "serviceCategoryId",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select a Category</option>
                        {getBrandCategoryListResponsObj.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name.en}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <TagsInput
                        value={
                          createServiceFormFieldsValues.serviceIncludesArrayEn
                        }
                        onChange={(value) =>
                          handleCreateServiceTextInputFieldChange(
                            "serviceIncludesArrayEn",
                            value
                          )
                        }
                        placeHolder="Includes (En)"
                        className="mnblkjj"
                      />
                    </label>
                    <label>
                      <TagsInput
                        classNames="mnblkjj"
                        value={
                          createServiceFormFieldsValues.serviceIncludesArrayAr
                        }
                        style={{ marginLeft: "10px", color: "red" }}
                        onChange={(value) =>
                          handleCreateServiceTextInputFieldChange(
                            "serviceIncludesArrayAr",
                            value
                          )
                        }
                        placeHolder="Includes (AR)"
                      />
                    </label>
                  </div>
                </div>
                <div className="btn-add-not">
                  <Button
                    onClick={handleCreateServiceBtnClick}
                    disabled={
                      isExceedingMaxLengthEn ||
                      isExceedingMaxLengthAr ||
                      isExceedingMaxLengthEnDescriptionEn ||
                      isExceedingMaxLengthEnDescriptionAr ||
                      isExceedingMaxLengthPrice ||
                      isExceedingMaxLengthDuration ||
                      isExceedingMaxLengthLateTime ||
                      !createServiceFormFieldsValues.serviceCategory ||
                      !createServiceFormFieldsValues.serviceImage ||
                      !createServiceFormFieldsValues.serviceTitleEn ||
                      !createServiceFormFieldsValues.serviceTitleAr ||
                      !createServiceFormFieldsValues.serviceDescriptionEn ||
                      !createServiceFormFieldsValues.serviceDescriptionAr ||
                      !createServiceFormFieldsValues.servicePrice ||
                      !createServiceFormFieldsValues.serviceDuration ||
                      !createServiceFormFieldsValues.serviceLateLimit ||
                      createServiceFormFieldsValues.serviceIncludesArrayEn
                        .length === 0 ||
                      createServiceFormFieldsValues.serviceIncludesArrayAr
                        .length === 0
                    }
                    className={`${
                      isExceedingMaxLengthEn ||
                      isExceedingMaxLengthAr ||
                      isExceedingMaxLengthEnDescriptionEn ||
                      isExceedingMaxLengthEnDescriptionAr ||
                      isExceedingMaxLengthPrice ||
                      isExceedingMaxLengthDuration ||
                      isExceedingMaxLengthLateTime ||
                      !createServiceFormFieldsValues.serviceCategory ||
                      !createServiceFormFieldsValues.serviceImage ||
                      !createServiceFormFieldsValues.serviceTitleEn ||
                      !createServiceFormFieldsValues.serviceTitleAr ||
                      !createServiceFormFieldsValues.serviceDescriptionEn ||
                      !createServiceFormFieldsValues.serviceDescriptionAr ||
                      !createServiceFormFieldsValues.servicePrice ||
                      !createServiceFormFieldsValues.serviceDuration ||
                      !createServiceFormFieldsValues.serviceLateLimit ||
                      createServiceFormFieldsValues.serviceIncludesArrayEn
                        .length === 0 ||
                      createServiceFormFieldsValues.serviceIncludesArrayAr
                        .length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-700"
                    } text-white py-2 px-4 rounded`}
                  >
                    Create Service
                  </Button>
                </div>
              </ModalBody>
            </div>
          )}
        </ModalContent>
      </Modal>

      <Modal
        hideCloseButton
        className="update-service-popup"
        size="4xl"
        isOpen={isEditOpen}
        onOpenChange={onEditClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="">
                <ModalHeader className="">
                  <div className="add-user-header">
                    <div className="provider-img">
                      <img
                        src="/Subtract21.png"
                        alt=""
                        onClick={() =>
                          document.querySelector("#service-edit-file").click()
                        }
                      />
                      <p>{editServiceFormFieldsValues.serviceImage.name}</p>
                      <input
                        type="file"
                        onChange={(event) =>
                          handleEditServiceImageChange(event)
                        }
                        id="service-edit-file"
                        hidden
                      />
                    </div>
                    <div className="provider-data">
                      <h3>Update Service</h3>
                    </div>
                  </div>
                </ModalHeader>
              </ModalHeader>

              <ModalBody>
                <div className="">
                  <div className="add-user-labels">
                    <div className="labels-names">
                      <label>
                        <input
                          placeholder="Service Title (EN)"
                          className="mnblkjj"
                          type="text"
                          value={editServiceFormFieldsValues.serviceTitleEn}
                          onChange={(e) =>
                            handleEditServiceTextInputFieldChange(
                              "serviceTitleEn",
                              e.target.value
                            )
                          }
                          maxLength={31}
                        />
                        {isExceedingMaxLengthEn && (
                          <div className="error-message">
                            Please reduce the length to 30 characters or less.
                          </div>
                        )}
                      </label>
                      <label>
                        <input
                          placeholder="Service Title (AR)"
                          className="mnblkjj"
                          type="text"
                          value={editServiceFormFieldsValues.serviceTitleAr}
                          onChange={(e) =>
                            handleEditServiceTextInputFieldChange(
                              "serviceTitleAr",
                              e.target.value
                            )
                          }
                          maxLength={31}
                        />
                        {isExceedingMaxLengthAr && (
                          <div className="error-message">
                            Please reduce the length to 30 characters or less.
                          </div>
                        )}
                      </label>
                      <label>
                        <textarea
                          placeholder="Service Description (EN)"
                          className="mnblkjj"
                          type="text"
                          value={
                            editServiceFormFieldsValues.serviceDescriptionEn
                          }
                          onChange={(e) =>
                            handleEditServiceTextInputFieldChange(
                              "serviceDescriptionEn",
                              e.target.value
                            )
                          }
                          maxLength={501}
                        />
                        {isExceedingMaxLengthEnDescriptionEn && (
                          <div className="error-message">
                            Please reduce the length to 500 characters or less.
                          </div>
                        )}
                      </label>
                      <label>
                        <textarea
                          placeholder="Service Description (AR)"
                          className="mnblkjj"
                          type="text"
                          value={
                            editServiceFormFieldsValues.serviceDescriptionAr
                          }
                          onChange={(e) =>
                            handleEditServiceTextInputFieldChange(
                              "serviceDescriptionAr",
                              e.target.value
                            )
                          }
                          maxLength={501}
                        />
                        {isExceedingMaxLengthEnDescriptionAr && (
                          <div className="error-message">
                            Please reduce the length to 500 characters or less.
                          </div>
                        )}
                      </label>
                      <label>
                        <input
                          placeholder="Service Price"
                          className="mnblkjj"
                          type="number"
                          value={editServiceFormFieldsValues.servicePrice}
                          onChange={(e) =>
                            handleEditServiceTextInputFieldChange(
                              "servicePrice",
                              e.target.value
                            )
                          }
                          maxLength={1000000}
                        />
                        {isExceedingMaxLengthPrice && (
                          <div className="error-message">
                            Please reduce the length to 10 number and not less
                            than 1.
                          </div>
                        )}
                      </label>
                      <label>
                        <input
                          placeholder="Service Duration"
                          className="mnblkjj"
                          type="text"
                          value={editServiceFormFieldsValues.serviceDuration}
                          onChange={(e) =>
                            handleEditServiceTextInputFieldChange(
                              "serviceDuration",
                              e.target.value
                            )
                          }
                          maxLength={1000000}
                        />
                        {isExceedingMaxLengthDuration && (
                          <div className="error-message">
                            Please reduce the length to 10 number and not less
                            than 1.
                          </div>
                        )}
                      </label>{" "}
                      <select
                        id="selectOption"
                        value={editServiceFormFieldsValues.serviceLocation}
                        onChange={(e) =>
                          handleEditServiceTextInputFieldChange(
                            "serviceLocation",
                            e.target.value
                          )
                        }
                        className="mnblkjj"
                        style={{ background: "none" }}
                      >
                        <option value="">Services Location</option>
                        {locations.map((loc) => (
                          <option
                            key={loc.serviceLocation}
                            value={loc.serviceLocation}
                          >
                            {loc.serviceLocation}
                          </option>
                        ))}
                      </select>
                      <label>
                        <input
                          placeholder="Service Late Limit"
                          className="mnblkjj"
                          type="text"
                          value={editServiceFormFieldsValues.serviceLateLimit}
                          onChange={(e) =>
                            handleEditServiceTextInputFieldChange(
                              "serviceLateLimit",
                              e.target.value
                            )
                          }
                          maxLength={1000000}
                        />
                        {isExceedingMaxLengthLateTime && (
                          <div className="error-message">
                            Please reduce the length to 10 number and not less
                            than 1.
                          </div>
                        )}
                      </label>
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <label style={{ marginRight: "10px" }}>
                          <TagsInput
                            classNames="mnblkjj"
                            value={
                              editServiceFormFieldsValues.serviceIncludesArrayEn
                            }
                            onChange={(value) =>
                              handleEditServiceTextInputFieldChange(
                                "serviceIncludesArrayEn",
                                value
                              )
                            }
                            placeHolder="Includes (En)"
                          />
                        </label>
                        <label>
                          <TagsInput
                            classNames="mnblkjj"
                            value={
                              editServiceFormFieldsValues.serviceIncludesArrayAr
                            }
                            onChange={(value) =>
                              handleEditServiceTextInputFieldChange(
                                "serviceIncludesArrayAr",
                                value
                              )
                            }
                            placeHolder="Includes (AR)"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <div className="btn-add-not">
                <Button onClick={(e) => handleEditServiceBtnClick(e)}>
                  Update Service
                </Button>
              </div>
            </>
          )}
        </ModalContent>
        ;
      </Modal>
      <Modal
        className="show-service-popup"
        isOpen={isViewOpen}
        onClose={onViewClose}
        size="3xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <div className="hhhhh">
                <ModalHeader>
                  <div className="mx-auto ">
                    <img
                      className="service-popup-image"
                      src={getBrandServicesListResponsObj?.image}
                      alt=""
                    />
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="aboutserv-cont">
                    <h4 class="about-the-service">aboutTheService </h4>
                    <div className="show-service-popup-details">
                      <Tooltip title="TheServiceName">
                        <p className="value-txt">
                          <span className="name-txt">aboutTheServiceName</span>{" "}
                          {getBrandServicesListResponsObj?.title?.en}
                        </p>
                      </Tooltip>

                      {/* <p>
                    <span className="font-bold">Name AR:</span>{" "}
                    {selectedServiceForShowDetails.title.ar}
                  </p> */}
                      <Tooltip title="TheServiceDescription">
                        <p className="value-txt">
                          <span className="name-txt">
                            aboutTheServiceDescription
                          </span>{" "}
                          {getBrandServicesListResponsObj?.description?.en}
                        </p>
                      </Tooltip>

                      {/* <p>
                    <span className="font-bold">Description ar:</span>{" "}
                    {selectedServiceForShowDetails.description.ar}
                  </p> */}
                      <Tooltip title="TheServicetime">
                        <p className="value-txt">
                          <span className="name-txt">
                            aboutTheServiceDuration
                          </span>{" "}
                          {getBrandServicesListResponsObj?.duration}
                        </p>
                      </Tooltip>
                      <Tooltip title="TheServiceprice">
                        {" "}
                        <p className="value-txt">
                          <span className="name-txt">aboutTheServicePrice</span>{" "}
                          {getBrandServicesListResponsObj?.price}
                        </p>
                      </Tooltip>

                      <Tooltip title="This is the time you are allowed to be late">
                        <p className="value-txt">
                          <span className="name-txt">
                            aboutTheServiceLateLimit
                          </span>
                          {getBrandServicesListResponsObj?.lateLimit}
                        </p>
                      </Tooltip>
                      <Tooltip title="Is this service available in branch or not">
                        {" "}
                        <p className="value-txt">
                          <span className="name-txt">
                            aboutTheServiceAvailability
                          </span>{" "}
                          ( `locations.$
                          {getBrandServicesListResponsObj?.serviceLocation}` )
                        </p>
                      </Tooltip>

                      <Tooltip title="Is this service deleted or available">
                        <p>
                          <span className="name-txt">Deleted:</span>{" "}
                          {getBrandServicesListResponsObj?.deletedAt ? (
                            <p className="value-txt">Deleted</p>
                          ) : (
                            <span className="value-txt">Avaliable</span>
                          )}
                        </p>
                      </Tooltip>
                    </div>

                    <div className="buttons-cont">
                      <button
                        class="Edit-service"
                        onClick={() =>
                          handleEditClick(getBrandServicesListResponsObj)
                        }
                      >
                        editService
                      </button>
                      <div className="actions-container">
                        {getBrandServicesListResponsObj?.deletedAt ? (
                          <button
                            className="unremove-btn"
                            onClick={() =>
                              handleUnremoveServiceBtnClick(
                                getBrandServicesListResponsObj?.id
                              )
                            }
                          >
                            <div className="VerBan">
                              <h1>Unremove service</h1>
                            </div>
                          </button>
                        ) : (
                          <button
                            className="remove-btn"
                            onClick={() =>
                              handleRemoveServiceBtnClick(
                                getBrandServicesListResponsObj?.id
                              )
                            }
                          >
                            <div className="Noban">
                              <h1>Remove service</h1>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </ModalBody>
              </div>
              <ModalFooter className="justify-between items-center max-md:flex-col gap-6 service-popup-footer">
                <div className="flex flex-col justify-center items-center">
                  <Tooltip title="How many people booked this service">
                    {" "}
                    <p className="service-books">serviceBooks</p>
                  </Tooltip>
                  <p className="clients-number">
                    {getBrandServicesListResponsObj?.bookingCount} booksClients
                  </p>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <p className="service-rate">
                    <Tooltip title="The rating of this service">
                      {" "}
                      {getBrandServicesListResponsObj?.rating}
                    </Tooltip>
                  </p>
                  <div className="service-popup-stars">
                    <div className="stars flex items-center">
                      {renderStars(getBrandServicesListResponsObj?.rating)}
                    </div>
                  </div>
                  <Tooltip title="The Service reviews">
                    <p className="service-rate-reviews">
                      +{getBrandServicesListResponsObj?.ratingCount} rateNumber
                    </p>
                  </Tooltip>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <Tooltip title="The Service popularity between peoples">
                    {" "}
                    <p className="service-popularity">servicePopularity</p>
                  </Tooltip>
                  <p className="clients-number">
                    {getBrandServicesListResponsObj?.pop}%
                  </p>
                </div>
              </ModalFooter>
              <div className="line-popup"></div>
              <ModalFooter>
                <div className="inclides-container">
                  <Tooltip title="this Service offer">
                    <span className="includes-txt">
                      aboutTheServiceIncludes:
                      <span className="length-number">
                        {getBrandServicesListResponsObj?.includes?.length}
                      </span>
                    </span>
                  </Tooltip>
                  <div className="includes-container">
                    {getBrandServicesListResponsObj?.includes?.map((item) => (
                      <p className="includess">{item?.en}</p>
                    ))}
                  </div>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </form>
  );
}

export default BrandsMain;
