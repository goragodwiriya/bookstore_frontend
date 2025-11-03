-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 03, 2025 at 05:32 PM
-- Server version: 10.11.13-MariaDB-0ubuntu0.24.04.1
-- PHP Version: 8.4.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `book_store`
--

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `category_id` int(11) NOT NULL,
  `price` double(10,2) NOT NULL,
  `original_price` double(10,2) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 0.0,
  `reviews` int(11) DEFAULT 0,
  `featured` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `cover` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `title`, `author`, `category_id`, `price`, `original_price`, `rating`, `reviews`, `featured`, `description`, `cover`, `created_at`, `updated_at`) VALUES
(1, 'The Midnight Library', 'Matt Haig', 1, 12.99, 16.99, 4.5, 234, 1, 'A thought-provoking novel about life\'s infinite possibilities and the choices we make.', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:44:34'),
(2, 'Atomic Habits', 'James Clear', 2, 14.99, 19.99, 4.8, 512, 1, 'An easy & proven way to build good habits & break bad ones.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:45:10'),
(3, 'Dune', 'Frank Herbert', 3, 13.99, 17.99, 4.7, 445, 1, 'Epic science fiction novel set in the distant future amidst a feudal interstellar society.', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:45:37'),
(4, 'Clean Code', 'Robert C. Martin', 4, 18.99, 21.99, 4.6, 678, 1, 'A handbook of agile software craftsmanship that teaches the art of writing clean code.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:46:01'),
(5, 'The Psychology of Money', 'Morgan Housel', 5, 22.99, 26.99, 4.5, 423, 0, 'Timeless lessons on wealth, greed, and happiness for making better life decisions.', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:46:16'),
(6, 'Educated', 'Tara Westover', 6, 17.99, 21.99, 4.5, 423, 0, 'A memoir about a woman who leaves her survivalist family and goes on to earn a PhD.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:46:29'),
(7, 'The Silent Patient', 'Alex Michaelides', 7, 16.99, 21.99, 4.4, 323, 0, 'A psychological thriller about a woman who refuses to speak after allegedly murdering her husband.', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:46:46'),
(8, 'Deep Work', 'Cal Newport', 2, 42.99, 46.99, 4.7, 892, 1, 'Rules for focused success in a distracted world.', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:45:16'),
(9, 'The Pragmatic Programmer', 'Andrew Hunt', 4, 42.99, 46.99, 4.7, 892, 1, 'From Journeyman to Master - A guide to pragmatic programming and software development.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:46:03'),
(10, 'Sapiens', 'Yuval Noah Harari', 8, 23.99, 26.99, 4.6, 678, 1, 'A brief history of humankind, exploring how Homo sapiens came to dominate the world.', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:46:52'),
(11, 'Becoming', 'Michelle Obama', 6, 20.99, 24.99, 4.5, 423, 0, 'The memoir of the former First Lady of the United States.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:46:34'),
(12, 'The Girl with the Dragon Tattoo', 'Stieg Larsson', 9, 19.99, 23.99, 4.2, 267, 0, 'A gripping mystery thriller about a journalist and a computer hacker investigating a wealthy family.', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:47:01'),
(13, 'The Design of Everyday Things', 'Don Norman', 10, 11.99, 14.99, 4.6, 445, 0, 'A book about design, human-centered design, and the psychology of everyday objects.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:47:07'),
(14, 'Thinking, Fast and Slow', 'Daniel Kahneman', 11, 24.99, 27.99, 4.1, 334, 0, 'A groundbreaking exploration of the two systems that drive the way we think and make decisions.', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:47:14'),
(15, 'The Alchemist', 'Paulo Coelho', 1, 17.99, 20.99, 4.5, 423, 0, 'A timeless tale about following your dreams and listening to your heart.', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:44:40'),
(16, 'The Lean Startup', 'Eric Ries', 12, 25.99, 28.99, 4.3, 567, 0, 'How today\'s entrepreneurs use continuous innovation to create radically successful businesses.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:47:18'),
(17, 'The Subtle Art of Not Giving a F*ck', 'Mark Manson', 2, 19.99, 22.99, 4.1, 334, 0, 'A counterintuitive approach to living a good life.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:45:23'),
(18, 'Where the Crawdads Sing', 'Delia Owens', 1, 17.99, 20.99, 4.5, 423, 0, 'A mystery novel about a woman who lived in isolation in the marshes of North Carolina.', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:44:44'),
(19, 'Zero to One', 'Peter Thiel', 12, 22.99, 25.99, 4.3, 567, 0, 'Notes on startups, or how to build the future.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:47:22'),
(20, 'The 7 Habits of Highly Effective People', 'Stephen R. Covey', 2, 20.99, 23.99, 4.1, 334, 0, 'Powerful lessons in personal change for achieving extraordinary effectiveness.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop', '2025-11-03 08:43:44', '2025-11-03 08:45:20');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `icon` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `icon`, `created_at`) VALUES
(1, 'Fiction', 'fas fa-dragon', '2025-11-03 08:43:44'),
(2, 'Self-Help', 'fas fa-microscope', '2025-11-03 08:43:44'),
(3, 'Science Fiction', 'fas fa-atom', '2025-11-03 08:43:44'),
(4, 'Technology', 'fas fa-landmark', '2025-11-03 08:43:44'),
(5, 'Finance', 'fas fa-laptop-code', '2025-11-03 08:43:44'),
(6, 'Biography', 'fas fa-palette', '2025-11-03 08:43:44'),
(7, 'Thriller', 'fas fa-dragon', '2025-11-03 08:43:44'),
(8, 'History', 'fas fa-microscope', '2025-11-03 08:43:44'),
(9, 'Mystery', 'fas fa-atom', '2025-11-03 08:43:44'),
(10, 'Design', 'fas fa-palette', '2025-11-03 08:43:44'),
(11, 'Psychology', 'fas fa-laptop-code', '2025-11-03 08:43:44'),
(12, 'Business', 'fas fa-landmark', '2025-11-03 08:43:44');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_featured` (`featured`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_price` (`price`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
