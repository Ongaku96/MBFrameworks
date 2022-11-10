/**Enumerator that reference the most common var data types */
const datatypes = {
  empty: 1,
  string: 2,
  array: 3,
  object: 4,
  number: 5,
  xhr: 6,
  date: 7,
};
/**List of useful regex */
const regex = {
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
const filesize = [
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
