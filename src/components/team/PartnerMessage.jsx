import Image from "next/image";
import { FaUser } from "react-icons/fa";

export default function PartnerMessage({ userName, date, message, userImage }) {
    // Create a Date object
    const dateObj = new Date(date);

    // Options for formatting the date and time
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

    // Format the date and time
    const formattedDate = dateObj.toLocaleDateString('en-GB', dateOptions);
    const formattedTime = dateObj.toLocaleTimeString('en-GB', timeOptions);

    // Combine date and time into a single string
    const fullFormattedDate = `${formattedDate} ${formattedTime}`;

    const getImageSrc = (imageUrl) => {
        if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            return imageUrl;
        }
        return null;
    };

    return (
        <div className="max-w-full">
            <div className="flex flex-col mb-1">
                <span className="text-xs text-gray-300">{userName}</span>
            </div>
            <div className="flex justify-start mb-4 items-start" title={fullFormattedDate}>
                <div className="relative w-10 h-10 flex-shrink-0">
                    {getImageSrc(userImage) ? (
                        <Image
                            src={getImageSrc(userImage)}
                            alt="member Image"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-full"
                        />
                    ) : (
                        <FaUser className="w-full h-full text-gray-400" />
                    )}
                </div>
                <div className="ml-2 py-3 px-4 bg-gray-400 bg-opacity-25 rounded-br-3xl rounded-tr-3xl rounded-tl-xl max-w-[75%]">
                    <p className="break-words whitespace-pre-wrap">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}