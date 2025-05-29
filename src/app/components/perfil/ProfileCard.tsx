"use client";
import Image from "next/image";
import React from "react";

interface ProfileCardProps {
  title: string;
  description: string;
  imageSrc: string;
  onClick?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  title,
  description,
  imageSrc,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl shadow hover:shadow-md cursor-pointer transition p-4 flex flex-col items-center text-center w-full sm:w-58"
  >
    <Image
      src={imageSrc}
      alt={title}
      width={97}
      height={97}
      objectFit="cover"
      className="mb-4 rounded-full"
      priority
    />
    <h3 className="font-semibold text-gray-800">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);

export default ProfileCard;
