const postStatus = (status) => {
  if (status === "approved") return { status: "approved" };
  if (status === "rejected") return { status: "rejected" };
  if (status === "draft") return { status: "draft" };
  return { status: "pending" };
};

module.exports = postStatus;
