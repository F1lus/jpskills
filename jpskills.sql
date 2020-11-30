-- phpMyAdmin SQL Dump
-- version 4.8.2
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2020. Okt 13. 00:07
-- Kiszolgáló verziója: 10.1.34-MariaDB
-- PHP verzió: 7.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `jpskills`
--
CREATE DATABASE IF NOT EXISTS `jpskills` DEFAULT CHARACTER SET utf8 COLLATE utf8_hungarian_ci;
USE `jpskills`;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `exams`
--

CREATE TABLE `exams` (
  `exam_id` int(11) NOT NULL,
  `exam_itemcode` varchar(18) CHARACTER SET utf8 NOT NULL COMMENT 'vizsga terméke',
  `exam_form_number` varchar(12) COLLATE utf8_hungarian_ci NOT NULL COMMENT 'utasítás formalapszáma',
  `exam_name` varchar(100) COLLATE utf8_hungarian_ci DEFAULT NULL COMMENT 'vizsga megnevezése',
  `exam_notes` varchar(200) COLLATE utf8_hungarian_ci DEFAULT NULL COMMENT 'vizsga egyéb megjegyzések',
  `exam_docs` blob COMMENT 'feltöltendő doksi',
  `exam_creator` varchar(50) COLLATE utf8_hungarian_ci DEFAULT NULL COMMENT 'létrehozta',
  `exam_creation_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'ennek ideje',
  `exam_modifier` varchar(50) COLLATE utf8_hungarian_ci DEFAULT NULL COMMENT 'módosította',
  `exam_modified_time` datetime DEFAULT NULL COMMENT 'ennek ideje',
  `exam_status` bit(1) DEFAULT NULL COMMENT 'aktív-e',
  `points_required` int(11) NOT NULL COMMENT 'szükséges pontszám'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `exam_prepare`
--

CREATE TABLE `exam_prepare` (
  `id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `results_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `exam_result`
--

CREATE TABLE `exam_result` (
  `id` int(11) NOT NULL,
  `worker_id` int(10) UNSIGNED NOT NULL,
  `question_id` int(11) NOT NULL,
  `points` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `items`
--

CREATE TABLE `items` (
  `ID` int(11) NOT NULL,
  `ProductName` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `Itemcode` varchar(18) CHARACTER SET utf8 NOT NULL,
  `RawMaterial` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `QTY` varchar(10) CHARACTER SET utf8 DEFAULT '1',
  `Types` varchar(20) CHARACTER SET utf8 DEFAULT 'EGYEB',
  `Groups` varchar(20) CHARACTER SET utf8 DEFAULT 'EGYEB',
  `InProcess` varchar(50) CHARACTER SET utf8 DEFAULT 'Aktiv',
  `EllDB` varchar(4) CHARACTER SET utf8 DEFAULT '1',
  `ProductWeight_gr` float DEFAULT NULL,
  `PackageWeight_kg` float DEFAULT NULL,
  `Gyar` varchar(4) CHARACTER SET utf8 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- A tábla adatainak kiíratása `items`
--

INSERT INTO `items` (`ID`, `ProductName`, `Itemcode`, `RawMaterial`, `QTY`, `Types`, `Groups`, `InProcess`, `EllDB`, `ProductWeight_gr`, `PackageWeight_kg`, `Gyar`) VALUES
(19470, 'CORELINE DL3 DRIVER COVER 2000LM', '444313003661', '', '120', 'PHILIPS', 'PHILIPS', 'Aktiv', '8', 53, 0, '1280'),
(19480, 'GS2 1000lm Reflector-white', '444170077111', 'PC TR-3025N1/3452BU Fehér', '60', 'PHILIPS', 'PHILIPS', 'Aktiv', '5', 36, 0, '1280'),
(22216, 'Persely bal NDM-3554', '263001306', 'POM + E920 zöld', '1', 'ELECTROLUX', 'G128POMEX', 'Aktiv', '2', 0, 0, '1280'),
(24776, 'Light guide', 'JDPLS1004513', 'PC Macrolon 2805 crystal clear', '5000', 'JABIL', 'G103ABSNM', 'Aktiv', '80', 0.8, 0, '1280'),
(24777, 'Station upper part', 'JDPLS1004522', 'ABS Terluran GP-22 Fekete', '150', 'JABIL', 'G128ABSIT', 'Aktiv', '8', 24.5, 0, '1280'),
(24778, 'Station lower part', 'JDPLS1004541', 'ABS Terluran GP-22 Fekete', '150', 'JABIL', 'G128ABSIT', 'Aktiv', '8', 25, 0, '1280'),
(25031, 'SCOOT backft wheel hub L', '256100', 'PA6+20% GF', '40', 'STOKKE', 'STOKKE', 'Aktiv', '5', 52, 0, '1280'),
(25797, 'Scoot Fold Side Cover Assy R', '9258000', 'PP', '160', 'STOKKE', 'STOKKE', 'Aktiv', '5', 0, 0, '1280'),
(25798, 'Scoot Fold Release Lock L Assy', '9258800', 'PP', '110', 'STOKKE', 'STOKKE', 'Aktiv', '8', 0, 0, '1280'),
(26056, 'Szerelt kosár', 'A05013002', 'PS', '24', 'ELECTROLUX', 'G128SZEEX', 'Aktiv', '3', 0, 0, '1280'),
(26311, 'Top Panel Assembly 272 painted', 'A05623404', 'Szerelt', '1', 'ELECTROLUX', 'G128SZEEX', 'Aktiv', '2', 0, 0, '1280'),
(27333, 'SCOOT Frontft footrest btn L black', '385700-F', 'PA6', '1', 'STOKKE', 'STOKKE', 'Aktiv', '2', 0, 0, '1280'),
(27973, 'Flex Top Support', 'P-00004548I5S', 'PC Lexan EXL 1132T Fekete', '624', 'CELESTICA', 'CELESTICA', 'Aktiv', '32', 1, 0, '1280'),
(27974, 'Flex Bottom Support', 'P-00004550I5S', 'PC Lexan EXL 1132T Fekete', '600', 'CELESTICA', 'CELESTICA', 'Aktiv', '32', 0.25, 0, '1280'),
(27975, 'ANTENNA BOTTOM COVER', 'P-00004552I5S', 'PC Lexan EXL 1132T Fekete', '147', 'CELESTICA', 'CELESTICA', 'Aktiv', '20', 6, 0, '1280'),
(27976, 'Antenna Removable Cover', 'P-00004560I5S', 'PC Lexan EXL 1132T Fekete', '525', 'CELESTICA', 'CELESTICA', 'Aktiv', '32', 3, 0, '1280'),
(27977, 'Back Cover Protection Plug', 'P-00004564I5S', 'PC Lexan EXL 1132T Fekete', '900', 'CELESTICA', 'CELESTICA', 'Aktiv', '32', 1, 0, '1280'),
(28969, 'Obudowa 1.1 PC Ral-7035ZUSZSZELKAPoliure', 'M-00002-071', 'PC', '1', 'LUG', 'PHILIPS', 'Aktiv', '2', 0, 0, '1280'),
(29196, 'Bushing BY481P AB', '444313006981', 'POM', '2000', 'PHILIPS', 'PHILIPS', 'Aktiv', '50', 1, 1, '1280'),
(29319, 'Szerelt fagyasztó kosár NDM-5482 ELUX ST', '807914508', 'Szerelt', '22', 'CANNES KOSAR', 'ELUX', 'Aktiv', '3', 0, 0, '1280'),
(29320, 'Szerelt fagyasztó kosár NDM-5482 AEG ST', '807914509', 'Szerelt', '1', 'CANNES KOSAR', 'ELUX', 'Aktiv', '2', 0, 0, '1280'),
(29322, 'Szerelt fagy.kosár NDM-5479 ELUX ST', '807914620', 'Szerelt', '28', 'CANNES KOSAR', 'ELUX', 'Aktiv', '5', 0, 0, '1280'),
(29323, 'Szerelt fagy.kosár NDM-5479 AEG ST', '807914621', 'Szerelt', '1', 'CANNES KOSAR', 'ELUX', 'Aktiv', '2', 0, 0, '1280'),
(29324, 'Szerelt fagy.kosár NDM-5479 AEG', '807914622', 'Szerelt', '28', 'CANNES KOSAR', 'ELUX', 'Aktiv', '5', 0, 0, '1280'),
(29992, 'Obudowa 1.0 PC RED TRANSPIndoor 1246mm', 'OA-30480-011', 'PC', '45', 'LUG', 'PHILIPS', 'Aktiv', '5', 0, 0, '1280'),
(29993, 'Obudowa 1.0 PC ANTRACITEIndoor 1246mm', 'OA-30480-012', 'PC', '45', 'LUG', 'PHILIPS', 'Aktiv', '5', 0, 0, '1280'),
(30230, 'WALLWASHER COVER RAL9004', '828800047261', 'PC/ABS', '48', 'PHILIPS', 'PHILIPS', 'Aktiv', '5', 0, 0, '1280');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `languages`
--

CREATE TABLE `languages` (
  `id` int(11) NOT NULL,
  `place` varchar(50) COLLATE utf8_hungarian_ci NOT NULL COMMENT 'a hely ahova tartozik az oldalon belül',
  `hungarian` varchar(50) COLLATE utf8_hungarian_ci NOT NULL,
  `english` varchar(50) COLLATE utf8_hungarian_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `questions`
--

CREATE TABLE `questions` (
  `question_id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `question_name` varchar(50) COLLATE utf8_hungarian_ci DEFAULT NULL COMMENT 'kérdés neve',
  `points` int(11) NOT NULL,
  `picture` blob
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `results`
--

CREATE TABLE `results` (
  `results_id` int(11) NOT NULL,
  `result_text` text COLLATE utf8_hungarian_ci NOT NULL,
  `correct` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `skills`
--

CREATE TABLE `skills` (
  `skills_id` int(11) NOT NULL,
  `worker_id` int(11) UNSIGNED DEFAULT NULL COMMENT 'dolgozó id',
  `exam_id` int(11) DEFAULT NULL COMMENT 'vizsga id',
  `points` int(11) NOT NULL,
  `completed` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `workers`
--

CREATE TABLE `workers` (
  `worker_id` int(11) UNSIGNED NOT NULL,
  `worker_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_hungarian_ci NOT NULL COMMENT 'név',
  `worker_cardcode` bigint(20) NOT NULL COMMENT 'kártyaszám',
  `worker_prime_number` varchar(10) CHARACTER SET utf8 COLLATE utf8_hungarian_ci NOT NULL COMMENT 'törzsszám',
  `worker_usergroup_id_id` int(10) UNSIGNED NOT NULL COMMENT 'csoportid',
  `worker_usergroup` varchar(50) CHARACTER SET utf8 COLLATE utf8_hungarian_ci NOT NULL COMMENT 'csoport',
  `worker_factory` varchar(30) CHARACTER SET utf8 COLLATE utf8_hungarian_ci DEFAULT NULL COMMENT 'gyárkód',
  `worker_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'aktív-e'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- A tábla adatainak kiíratása `workers`
--

INSERT INTO `workers` (`worker_id`, `worker_name`, `worker_cardcode`, `worker_prime_number`, `worker_usergroup_id_id`, `worker_usergroup`, `worker_factory`, `worker_active`) VALUES
(6, 'Kovács Mihály', 123456789, '9548', 1, 'operátor', '1500', 1),
(9, 'Tóth Béla', 258485221, '5467', 1, 'operátor', '1280', 1),
(16, 'Kis Hajnalka', 264654322, '0209', 1, 'operátor', '1280', 1),
(28, 'Gazdag Zsolt', 951159369, '1593', 11, 'Karbantartó', '1280', 1),
(38, 'Szegény Zsigmond', 963258741, '2246', 6, 'Meo', '1280', 1),
(42, 'Teszt Elek', 147852963, '0276', 3, 'Vezető beállító', '1280', 1),
(46, 'Nagy Edina', 147987654, '2064', 2, 'Beállító', '1280', 1),
(56, 'Kiss Mária', 321456987, '12901', 7, 'Fröccs váltó', '1280', 1),
(149, 'Gulyás Péter', 582025874, '3273', 4, 'Technológus', '1280', 1),
(268, 'Magyar István', 258147357, '731', 5, 'Vezető technológus', '1280', 1),
(278, 'Mészáros Lőrinc', 159357852, '9200', 11, 'Karbantartó', '1700', 1),
(432, 'Fehér Rozália', 124587415, '9591', 15, 'Szerszám felfogók', '1280', 1),
(434, 'Lakatos Ronaldó', 102541584, '3910', 14, 'Adminisztrátor', '1280', 1),
(524, 'Kovács Eleonóra', 25814701, '3901', 10, 'Csoportvezető', '1280', 1),
(1280, 'Farkas Kovács Aranka', 698542505, 'Tanuló', 1, 'operátor', '1700', 1),
(1314, 'László Emese', 451561230, '1415', 99, 'admin', '1280', 1),
(1557, 'Veres Előd', 126802205, '6455', 14, 'Adminisztrátor', '1700', 1),
(1587, 'Koczka Anita', 985214720, '3087', 18, 'Termékfelelős', '1280', 1),
(1728, 'Nyúl Béla', 121775303, '7964', 98, 'supervisor', '1280', 1);

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`exam_form_number`),
  ADD KEY `exam_id` (`exam_id`),
  ADD KEY `exam_itemcode` (`exam_itemcode`);

--
-- A tábla indexei `exam_prepare`
--
ALTER TABLE `exam_prepare`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `results_id` (`results_id`);

--
-- A tábla indexei `exam_result`
--
ALTER TABLE `exam_result`
  ADD PRIMARY KEY (`id`),
  ADD KEY `worker_id` (`worker_id`),
  ADD KEY `question_id` (`question_id`);

--
-- A tábla indexei `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `IX_Items_Itemcode` (`Itemcode`),
  ADD KEY `IX_Items_QTY` (`QTY`),
  ADD KEY `IX_Groups` (`Groups`);

--
-- A tábla indexei `languages`
--
ALTER TABLE `languages`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `questions`
--
ALTER TABLE `questions`
  ADD KEY `question_id` (`question_id`),
  ADD KEY `exam_id` (`exam_id`);

--
-- A tábla indexei `results`
--
ALTER TABLE `results`
  ADD KEY `resuls_id` (`results_id`);

--
-- A tábla indexei `skills`
--
ALTER TABLE `skills`
  ADD KEY `skills_id` (`skills_id`),
  ADD KEY `worker_id` (`worker_id`),
  ADD KEY `exam_id` (`exam_id`);

--
-- A tábla indexei `workers`
--
ALTER TABLE `workers`
  ADD PRIMARY KEY (`worker_id`),
  ADD KEY `worker_usergroup` (`worker_usergroup`),
  ADD KEY `worker_usergroup_id_id` (`worker_usergroup_id_id`),
  ADD KEY `worker_name` (`worker_name`),
  ADD KEY `worker_cardcode` (`worker_cardcode`),
  ADD KEY `worker_prime_number` (`worker_prime_number`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `exams`
--
ALTER TABLE `exams`
  MODIFY `exam_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `items`
--
ALTER TABLE `items`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30231;

--
-- AUTO_INCREMENT a táblához `questions`
--
ALTER TABLE `questions`
  MODIFY `question_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `results`
--
ALTER TABLE `results`
  MODIFY `results_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `skills`
--
ALTER TABLE `skills`
  MODIFY `skills_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `workers`
--
ALTER TABLE `workers`
  MODIFY `worker_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1729;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `exams`
--
ALTER TABLE `exams`
  ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`exam_itemcode`) REFERENCES `items` (`Itemcode`);

--
-- Megkötések a táblához `exam_prepare`
--
ALTER TABLE `exam_prepare`
  ADD CONSTRAINT `exam_prepare_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`),
  ADD CONSTRAINT `exam_prepare_ibfk_2` FOREIGN KEY (`results_id`) REFERENCES `results` (`results_id`);

--
-- Megkötések a táblához `exam_result`
--
ALTER TABLE `exam_result`
  ADD CONSTRAINT `exam_result_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`worker_id`),
  ADD CONSTRAINT `exam_result_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`);

--
-- Megkötések a táblához `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`exam_id`);

--
-- Megkötések a táblához `skills`
--
ALTER TABLE `skills`
  ADD CONSTRAINT `skills_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`worker_id`),
  ADD CONSTRAINT `skills_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`exam_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
