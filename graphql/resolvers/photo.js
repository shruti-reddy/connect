const { Photo, User } = require("../../models");
const bindUser = require("./bind-user");

module.exports = {
  photos: async (args, req) => {
    if (!req.req.isAuth) {
      throw new Error("User is not authenticated");
    }
    try {
      let where = { user: args.userId };
      if (args.isMain) {
        where = { user: args.userId, isMain: args.isMain }
      }
      const photos = await Photo.find(where);
      return photos.map((photo) => {
        return {
          ...photo._doc,
          _id: photo.id,
          user: bindUser.bind(this, photo.user),
        };
      });
    } catch (err) {
      throw err;
    }
  },
  addPhoto: async (args, req) => {
    if (!req.req.isAuth) {
      throw new Error("User is not authenticated");
    }
    try {
      const userPhotoFound = await Photo.findOne({
        user: req.req.userId,
      });
      const photo = new Photo({
        user: req.req.userId,
        url: args.photoSaveType.url,
        description: args.photoSaveType.description,
      });
      if (!userPhotoFound) {
        photo.isMain = true;
      }
      const result = await photo.save();
      const user = await User.findById(req.req.userId);
      if (!user.photos) {
        user.photos = [];
      }
      user.photos.push(result.id);
      await user.save();
      return {
        ...result._doc,
        _id: result.id,
        user: bindUser.bind(this, result.user),
      };
    } catch (err) {
      throw err;
    }
  },
  setMainPhoto: async (args, req) => {
    if (!req.req.isAuth) {
      throw new Error("User is not authenticated");
    }
    const photoFound = await Photo.findOne({
      _id: args._id
    });
    if (!photoFound) {
      throw new Error("photo doesn't exist");
    }
    const existingMainPhoto = await Photo.findOne({
      isMain: true,
      user: req.req.userId
    });
    existingMainPhoto.isMain = false;
    await existingMainPhoto.save();
    // await Photo.updateOne({ isMain: true, user: req.req.userId }, { $set: { isMain: false } });
    photoFound.isMain = true;
    const result = await photoFound.save();
    return {
      ...result._doc,
      _id: result.id,
      user: bindUser.bind(this, result.user),
    }
  },
  deletePhoto: async (args, req) => {
    if (!req.req.isAuth) {
      throw new Error("User is not authenticated");
    }
    const photoFound = await Photo.findOne({
      _id: args._id,
    });
    if (!photoFound) {
      throw new Error("photo doesn't exist");
    }
    if (photoFound.isMain === true) {
      throw new Error("cannot delete main photo");
    }
    const result = await photoFound.deleteOne();
    const user = await User.findById(req.userId);
    user.photos = user.photos.filter((id) => id != args._id);
    await user.save();
    if (result) {
      return true;
    }
    return false;
  },
};
