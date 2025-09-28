// const SharpMulter = require("sharp-multer");
// const multer = require("multer");

// // const fileName = (og_filename, options) => {
// //   let newname =
// //     og_filename.split(".").slice(0, -1).join(".") +
// //     "_" +
// //     Date.now() +
// //     "." +
// //     options.fileFormat;
// //   return newname;
// // };

// // const storage = SharpMulter({
// //   destination: (req, file, cb) => cb(null, "./uploads"),
// //   imageOptions: {
// //     fileFormat: "jpg",
// //     quality: 80,
// //     resize: { width: 680, height: 680, resizeMode: "contain" },
// //   },
// //   filename: fileName,
// // });

// // upload = multer({ storage });

// // module.exports = upload;

// const fileName = (og_filename, options) => {
//   let newname =
//     og_filename.split(".").slice(0, -1).join(".") +
//     "_" +
//     Date.now() +
//     "." +
//     options.fileFormat;
//   return newname;
// };
// const storage = SharpMulter({
//   destination: (req, file, cb) => cb(null, "./uploads"),
//   imageOptions: {
//     fileFormat: "jpg",
//     quality: 80,
//     resize: { width: 680, height: 680, resizeMode: "contain" },
//   },
//   filename: fileName,
// });
// // store image in memory
// upload = multer({ storage });

// module.exports = upload;
const multer = require("multer");
const storage = multer.memoryStorage(); // store image in memory
const upload = multer({storage:storage });





module.exports = upload;