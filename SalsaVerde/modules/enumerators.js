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
export const filesize = {
  byte: {
    name: "Bytes",
    size: 8
  },
  kilobyte: {
    name: "KB",
    size: 8192
  },
  megabyte: {
    name: "MB",
    size: 8e+6
  },
  gigabyte: {
    name: "GB",
    size: 8e+9
  }
};
/**Type of actions that can be executed with the spice class */
export const spicetype = {
  /**It open a given link in a blank page */
  link: 0,
  /**Execute a function in javascript */
  script: 1,
  /**Run a Server Request with a javascript function execution as output */
  server: 2,
  /**Open system default email app to send an email */
  email: 3,
};
/**enumerator of on-screen message types */
export const snacktype = {
  /**a message of success */
  success: 0,
  /**a message that notificate that something gone wrong but it don't block the process */
  warning: 1,
  /**a message that indicate that a process failed */
  danger: 2,
  /**a message that indicate a server internal error */
  server: 3,
};
/**List of supported events in components */
export const eventrecipe = {
  /**server call to load data*/
  fire: "fire",
  /**render component completely or partially on the html page */
  cook: "cook",
  /**refresh partial item with some updated data */
  flash: "flash",
  /**abort all active server call */
  deadplate: "deadplate",
  /**End of server call either if it's a success or it ran into errors */
  ondeck: "ondeck",
  /**triggered when a server call is executed succesfully */
  tastegood: "tastegood",
  /**triggered when a server call ran into a problem */
  tastebad: "tastebad"
};
/**Enum for component state of elaboration */
export const staterecipe = {
  /**indicate that the item is ready and waiting for events */
  mise: 0,
  /**indicate that the item is elaborating data to build template */
  cooking: 1,
  /**indicate that the item has called the server and it is waiting a response */
  weeded: 2,
  /**set if the server call run into an error */
  error: 3,
  /**set if the server call is executed succesfully */
  heard: 4
};

