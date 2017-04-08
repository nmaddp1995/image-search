var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const querySchema = new Schema({
    "term":String,
    "when":String
});
/*global class*/ const modelClass= mongoose.model("shortUrl",querySchema);
module.exports = modelClass;