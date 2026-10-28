// @id 2.7
// @title BROKEN: returning an object from an arrow without brackets
// @section 2.7
// @expect error

// BROKEN
const makeDraft = (title) => { title: title, reactions: 0 };
