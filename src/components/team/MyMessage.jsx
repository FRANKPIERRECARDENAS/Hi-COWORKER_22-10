import Image from "next/image";
import { FaUser } from "react-icons/fa";

export default function MyMessage({ message, user }) {
    const getImageSrc = (imageUrl) => {
        if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            return imageUrl;
        }
        return null;
    };

    return (
        <div className="flex justify-end mb-4 items-start max-w-full">
            <div className="mr-2 py-3 px-4 bg-gray-300 bg-opacity-25 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl max-w-[75%]">
                <p className="break-words whitespace-pre-wrap">
                    {message}
                </p>
            </div>

            <div className="relative w-10 h-10 flex-shrink-0">
                {getImageSrc(user) ? (
                    <Image
                        src={getImageSrc(user)}
                        alt="member Image"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-full"
                    />
                ) : (
                    <FaUser className="w-full h-full text-gray-400" />
                )}
            </div>
        </div>
    );
}