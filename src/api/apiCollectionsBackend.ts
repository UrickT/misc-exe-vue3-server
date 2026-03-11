/** 所有的 API 路徑集合 */

const apiPrefix = "/misc-exe-vue3-api";

export const API_ROUTES = {
  PAPER: {
    BASE: `${apiPrefix}/papers`,
    GET_ALL: "/list",
    GET_BY_SN: "/:sn",
  },
  UPLOADED_FILE: {
    BASE: `${apiPrefix}/uploaded-files`,
    UPLOAD: "/upload",
    GET_ALL: "/list",
    GET_BY_SN: "/:sn",
    DELETE_BY_SN: "/:sn",
  },
};
