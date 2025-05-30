type MessageCardProps = {
  role: "user" | "assistant";
  message: string;
};

export const MessageCard = (props: MessageCardProps) => {
  return (
    <div
      className={`flex ${
        props.role === "user" ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-xs p-3 rounded-lg ${
          props.role === "user"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        {props.message}
      </div>
    </div>
  );
};

export default MessageCard;
