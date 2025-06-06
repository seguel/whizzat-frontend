"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";

interface ProfileCardProps {
  title: string;
  description: string;
  imageSrc: string;
  href: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  title,
  description,
  imageSrc,
  href,
}) => (
  <Link
    href={href}
    className="block hover:shadow-lg transition rounded-xl p-4 text-center bg-white"
  >
    {/* Centraliza só a imagem */}
    <div className="flex justify-center">
      <Image
        src={imageSrc}
        alt={title}
        width={97}
        height={97}
        className="mb-4 rounded-full"
        priority
      />
    </div>
    <h3 className="font-semibold text-gray-800">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </Link>
);

export default ProfileCard;
