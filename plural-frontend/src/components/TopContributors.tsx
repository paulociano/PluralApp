'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Avatar from './Avatar';
import { FiAward } from 'react-icons/fi';

export default function TopContributors() {
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    api.get('/users/top-contributors')
      .then(response => setContributors(response.data))
      .catch(error => console.error("Erro ao buscar maiores contribuidores:", error));
  }, []);

  if (contributors.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="font-lora font-bold text-[#2D4F5A] mb-6 flex items-center">
        <FiAward className="mr-3 text-[#2D4F5A]" />
        Ranking
      </h2>
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <ul className="space-y-4">
          {contributors.map((user, index) => (
            <li key={user.id}>
              <Link href={`/profile/${user.username || user.id}`} className="flex items-center space-x-4 hover:bg-gray-50 p-2 rounded-md">
                <span className="font-bold text-lg text-gray-400">{index + 1}</span>
                <Avatar name={user.name} size={40} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.points} pontos</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}