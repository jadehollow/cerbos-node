const { GRPC } = require("@cerbos/grpc");
const { users } = require("./db");

/* The Cerbos PDP instance */
const cerbos = new GRPC("localhost:3593", {
  tls: false,
});

const SHOW_PDP_REQUEST_LOG = false;

module.exports = async (principalId, action, resourceAtrr: any = {}) => {
  const user = users.find((item) => item.id === Number(principalId));

  /* the controller that checks if a user 
  has access to certain actions */
  const cerbosObject = {

    /* allows you to indicate which resource 
    policy you want to use for the resource 
    request from multiple resource policy files */
    resource: {
      /* kind maps to resource key in the resource policy 
      file. instances can contain multiple resource 
      requests that you want to test against the 
      resource policy file. In this demo, we're only 
      testing the blog post resource. */
      kind: "blogpost",
      /* maps to version in the resource policy file */
      policyVersion: "default",
      id: resourceAtrr.id + "" || "new",
      attributes: resourceAtrr,
    },

    /* contains the details of the user 
    making the resource request at that instance */
    principal: {
      id: principalId + "" || "0",
      policyVersion: "default",
      roles: [user?.role || "unknown"],
      attributes: user,
    },

    /* contains all of the available actions 
    you’ve created in the resource policy file */
    actions: [action],
  };

  SHOW_PDP_REQUEST_LOG &&
    console.log("cerbosObject \n", JSON.stringify(cerbosObject, null, 4));

  /* this method is used to check if the 
  user/principal is authorized to perform 
  the requested action at that instance */
  const cerbosCheck = await cerbos.checkResource(cerbosObject);

  const isAuthorized = cerbosCheck.isAllowed(action);

  if (!isAuthorized)
    throw new Error("You are not authorized to visit this resource");
  return true;
};