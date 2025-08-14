// @ts-ignore
const Avatar = ({ src, size = "w-10 h-10" }) => {
  return (
    <div
      className={`inline-flex items-center justify-center ${size} rounded-full bg-gray-200 overflow-hidden`}
    >
        <img
          src={src}
        //   alt={alt || "User avatar"}
          className="object-cover w-full h-full"
        />
    </div>
  );
};

export default Avatar;
