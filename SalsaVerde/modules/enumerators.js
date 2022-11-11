/**Enumerator that reference the most common var data types */
export const datatypes = {
  empty: 1,
  string: 2,
  array: 3,
  object: 4,
  number: 5,
  xhr: 6,
  date: 7,
};
/**List of useful regex */
export const regex = {
  numeric: /^(([0-9]*)|(([0-9]*)[\.\,]([0-9]*)))$/,
  textual: /\d/,
  mail: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  multiplemail:
    /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9\-]+\.)+([a-zA-Z0-9\-\.]+)+([;]([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9\-]+\.)+([a-zA-Z0-9\-\.]+))*$/,
  date: /(^(\d{2}|\d{1})[\/|\-|\.]+(\d{2}|\d{1})[\/|\-|\.]+\d{4})|(^(\d{4}[\/|\-|\.]+\d{2}|\d{1})[\/|\-|\.]+(\d{2}|\d{1}))$/,
  dateformat:
    /([0][1-9]|[1][0-9]|[2][0-9]|[3][0-1])[/|.|-|,|;]([0][1-9]|[1][0-2])[/|.|-|,|;](([1][9][0-9]{2}|[2][0-9]{3})|(\d{2}))/,
};
/**Enumerator for the file size formatter */
export const filesize = [
    {
        name: "Bytes",
        size: 8
    },
    {
        name: "KB",
        size: 8192
    },
    {
        name: "MB",
        size: 8e+6
    },
    {
        name: "GB",
        size: 8e+9
    }
];
export const spicetype = {
  link: 0,
  script: 1,
  server: 2,
  email: 3,
};
/**enumerator of on-screen message types */
export const snacktype = {
  success: 0,
  warning: 1,
  danger: 2,
  server: 3,
};
export const actionrecipe = {
  order: "order", //server call to load data
  cook: "cook", //render component on html page
  refuel: "refuel", //refresh partial item with some updated data
  abort: "abort", //abort all server call
};
export const staterecipe = {
  default: 0,
  loading: 1,
};

