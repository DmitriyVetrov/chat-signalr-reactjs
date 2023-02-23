import React, { useContext } from "react";
import { ApplicationContext } from "../../Contexts";
import AgentProperties from "./AgentProperties";
import CustomerProperties from "./CustomerProperties";
import GeneralChatProperties from "./GeneralChatProperties";

const PropertiesSideBar = () => {
  const appContext = useContext(ApplicationContext);

  if (
    appContext.selectedAgent.IsEmpty &&
    appContext.selectedRoom.id.includes("Internal_Chat")
  ) {
    return <GeneralChatProperties></GeneralChatProperties>;
  } else if (
    appContext.selectedAgent.IsEmpty &&
    appContext.selectedRoom.customer !== undefined
  ) {
    return (
      <CustomerProperties
        customer={appContext.selectedRoom.customer}></CustomerProperties>
    );
  } else {
    return <AgentProperties agent={appContext.selectedAgent}></AgentProperties>;
  }
};

export default PropertiesSideBar;
