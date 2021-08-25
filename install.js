
const Message = require('./api/message');
const fs = require('fs');
const Functions = require('./api/functions');
const config = require('./config.json');

const mysqlObject = require('mysql');

let mysql = mysqlObject.createPool({
    "host": config.mysql.host,
    "user": config.mysql.user,
    "password": config.mysql.password
});

const queries = [
    `CREATE DATABASE IF NOT EXISTS ${config.mysql.database}`,
    `CREATE TABLE IF NOT EXISTS nstats_assault_match_objectives (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        map int(11) NOT NULL,
        timestamp float NOT NULL,
        obj_id int(11) NOT NULL,
        player int(11) NOT NULL,
        bfinal int(11) NOT NULL,
        PRIMARY KEY (id))
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_assault_objects (
        id int(11) NOT NULL AUTO_INCREMENT,
        map int(11) NOT NULL,
        obj_order int(11) NOT NULL,
        name varchar(100) NOT NULL,
        obj_id int(11) NOT NULL,
        matches int(11) NOT NULL,
        taken int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_countries (
        id int(11) NOT NULL AUTO_INCREMENT,
        code varchar(2) NOT NULL,
        first int(11) NOT NULL,
        last int(11) NOT NULL,
        total int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_ctf_caps (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        map int(11) NOT NULL,
        team int(11) NOT NULL,
        grab_time float NOT NULL,
        grab int(11) NOT NULL,
        drops text NOT NULL,
        drop_times text NOT NULL,
        pickups text NOT NULL,
        pickup_times text NOT NULL,
        covers varchar(1000) NOT NULL,
        cover_times text NOT NULL,
        assists varchar(1000) NOT NULL,
        assist_carry_times text NOT NULL,
        assist_carry_ids text NOT NULL,
        cap int(11) NOT NULL,
        cap_time float NOT NULL,
        travel_time float NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_ctf_events (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        player int(11) NOT NULL,
        event varchar(30) NOT NULL,
        team int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_dom_control_points (
        id int(11) NOT NULL AUTO_INCREMENT,
        map int(11) NOT NULL,
        name varchar(100) NOT NULL,
        captured int(11) NOT NULL,
        matches int(11) NOT NULL,
        x float NOT NULL,
        y float NOT NULL,
        z float NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_dom_match_caps (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        time float NOT NULL,
        player int(11) NOT NULL,
        point int(11) NOT NULL,
        team int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_dom_match_control_points (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        map int(11) NOT NULL,
        name varchar(100) NOT NULL,
        captured int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_dom_match_player_score (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        player int(11) NOT NULL,
        score int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_faces (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        first int(11) NOT NULL,
        last int(11) NOT NULL,
        uses int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_ftp (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        host varchar(250) NOT NULL,
        port int(11) NOT NULL,
        user varchar(50) NOT NULL,
        password varchar(50) NOT NULL,
        target_folder varchar(250) NOT NULL,
        delete_after_import tinyint(1) NOT NULL,
        first int(11) NOT NULL,
        last int(11) NOT NULL,
        total_imports int(11) NOT NULL,
        delete_tmp_files int(1) NOT NULL,
        total_logs_imported int(11) NOT NULL,
        ignore_bots int(1) NOT NULL,
        ignore_duplicates int(1) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_gametypes (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        first int(11) NOT NULL,
        last int(11) NOT NULL,
        matches int(11) NOT NULL,
        playtime double NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_headshots (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        killer int(11) NOT NULL,
        victim int(11) NOT NULL,
        distance float NOT NULL,
        killer_team int(11) NOT NULL,
        victim_team int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_items (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        display_name varchar(100) NOT NULL,
        first int(11) NOT NULL,
        last int(11) NOT NULL,
        uses int(11) NOT NULL,
        matches int(11) NOT NULL,
        type int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_items_match (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        player_id int(11) NOT NULL,
        item int(11) NOT NULL,
        uses int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,
    `CREATE TABLE IF NOT EXISTS nstats_items_player (
        id int(11) NOT NULL AUTO_INCREMENT,
        player int(11) NOT NULL,
        item int(11) NOT NULL,
        first int(11) NOT NULL,
        last int(11) NOT NULL,
        uses int(11) NOT NULL,
        matches int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_kills (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        killer int(11) NOT NULL,
        killer_team int(11) NOT NULL,
        victim int(11) NOT NULL,
        victim_team int(11) NOT NULL,
        killer_weapon int(11) NOT NULL,
        victim_weapon int(11) NOT NULL,
        distance float NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_logs (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        imported int(11) NOT NULL,
        match_id int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_maps (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        title varchar(100) NOT NULL,
        author varchar(100) NOT NULL,
        ideal_player_count varchar(100) NOT NULL,
        level_enter_text varchar(100) NOT NULL,
        first int(11) NOT NULL,
        last int(11) NOT NULL,
        matches int(11) NOT NULL,
        playtime double NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_maps_flags (
        id int(11) NOT NULL AUTO_INCREMENT,
        map int(11) NOT NULL,
        team int(11) NOT NULL,
        x float NOT NULL,
        y float NOT NULL,
        z float NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_map_spawns (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(50) NOT NULL,
        map int(11) NOT NULL,
        x double NOT NULL,
        y double NOT NULL,
        z double NOT NULL,
        spawns int(11) NOT NULL,
        team int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_matches (
        id int(11) NOT NULL AUTO_INCREMENT,
        date int(11) NOT NULL,
        server int(11) NOT NULL,
        gametype int(11) NOT NULL,
        map int(11) NOT NULL,
        version int(11) NOT NULL,
        min_version int(11) NOT NULL,
        admin varchar(50) NOT NULL,
        email varchar(100) NOT NULL,
        region int(11) NOT NULL,
        motd text NOT NULL,
        mutators text NOT NULL,
        playtime float NOT NULL,
        end_type varchar(50) NOT NULL,
        start float NOT NULL,
        end float NOT NULL,
        insta int(11) NOT NULL,
        team_game int(11) NOT NULL,
        game_speed int(11) NOT NULL,
        hardcore int(11) NOT NULL,
        tournament int(11) NOT NULL,
        air_control float NOT NULL,
        use_translocator int(11) NOT NULL,
        friendly_fire_scale float NOT NULL,
        net_mode varchar(100) NOT NULL,
        max_spectators int(11) NOT NULL,
        max_players int(11) NOT NULL,
        total_teams int(11) NOT NULL,
        players int(11) NOT NULL,
        time_limit int(11) NOT NULL,
        target_score int(11) NOT NULL,
        dm_winner varchar(50) NOT NULL,
        dm_score int(11) NOT NULL,
        team_score_0 float NOT NULL,
        team_score_1 float NOT NULL,
        team_score_2 float NOT NULL,
        team_score_3 float NOT NULL,
        attacking_team int(11) NOT NULL,
        assault_caps int(11) NOT NULL,
        dom_caps int(11) NOT NULL,
        mh_kills int(11) NOT NULL,
        mh int(11) NOT NULL,
        views int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_match_connections (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        player int(11) NOT NULL,
        event tinyint(4) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_match_pings (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp int(11) NOT NULL,
        player int(11) NOT NULL,
        ping int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_match_player_score (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        player int(11) NOT NULL,
        score int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,
    `CREATE TABLE IF NOT EXISTS nstats_match_team_changes (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        player int(11) NOT NULL,
        team int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `,
    `CREATE TABLE IF NOT EXISTS nstats_monsters (
        id int(11) NOT NULL AUTO_INCREMENT,
        class_name varchar(150) COLLATE utf8_unicode_ci NOT NULL,
        display_name varchar(50) COLLATE utf8_unicode_ci NOT NULL,
        matches int(11) NOT NULL,
        deaths int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_monsters_match (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        monster int(11) NOT NULL,
        deaths int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_monsters_player_match (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        player int(11) NOT NULL,
        monster int(11) NOT NULL,
        kills int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_monsters_player_totals (
        id int(11) NOT NULL AUTO_INCREMENT,
        player int(11) NOT NULL,
        monster int(11) NOT NULL,
        matches int(11) NOT NULL,
        kills int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_monster_kills (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        timestamp float NOT NULL,
        monster int(11) NOT NULL,
        player int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_nexgen_stats_viewer (
        id int(11) NOT NULL AUTO_INCREMENT,
        title varchar(100) COLLATE utf8_unicode_ci NOT NULL,
        type int(11) NOT NULL,
        gametype int(11) NOT NULL,
        players int(11) NOT NULL,
        position int(11) NOT NULL,
        enabled tinyint(1) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_player_maps (
        id int(11) NOT NULL AUTO_INCREMENT,
        map int(11) NOT NULL,
        player int(11) NOT NULL,
        first int(11) NOT NULL,
        first_id int(11) NOT NULL,
        last int(11) NOT NULL,
        last_id int(11) NOT NULL,
        matches int(11) NOT NULL,
        playtime double NOT NULL,
        longest float NOT NULL,
        longest_id int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_player_matches (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        match_date int(11) NOT NULL,
        map_id int(11) NOT NULL,
        player_id int(11) NOT NULL,
        bot tinyint(1) NOT NULL,
        spectator tinyint(1) NOT NULL,
        played tinyint(1) NOT NULL,
        ip varchar(50) NOT NULL,
        country varchar(5) NOT NULL,
        face int(11) NOT NULL,
        voice int(11) NOT NULL,
        gametype int(11) NOT NULL,
        winner int(11) NOT NULL,
        draw int(11) NOT NULL,
        playtime float NOT NULL,
        team int(1) NOT NULL,
        first_blood int(1) NOT NULL,
        frags int(11) NOT NULL,
        score int(11) NOT NULL,
        kills int(11) NOT NULL,
        deaths int(11) NOT NULL,
        suicides int(11) NOT NULL,
        team_kills int(11) NOT NULL,
        spawn_kills int(11) NOT NULL,
        efficiency float NOT NULL,
        multi_1 int(11) NOT NULL,
        multi_2 int(11) NOT NULL,
        multi_3 int(11) NOT NULL,
        multi_4 int(11) NOT NULL,
        multi_5 int(11) NOT NULL,
        multi_6 int(11) NOT NULL,
        multi_7 int(11) NOT NULL,
        multi_best int(11) NOT NULL,
        spree_1 int(11) NOT NULL,
        spree_2 int(11) NOT NULL,
        spree_3 int(11) NOT NULL,
        spree_4 int(11) NOT NULL,
        spree_5 int(11) NOT NULL,
        spree_6 int(11) NOT NULL,
        spree_7 int(11) NOT NULL,
        spree_best int(11) NOT NULL,
        best_spawn_kill_spree int(11) NOT NULL,
        flag_assist int(11) NOT NULL,
        flag_return int(11) NOT NULL,
        flag_taken int(11) NOT NULL,
        flag_dropped int(11) NOT NULL,
        flag_capture int(11) NOT NULL,
        flag_pickup int(11) NOT NULL,
        flag_seal int(11) NOT NULL,
        flag_cover int(11) NOT NULL,
        flag_cover_pass int(11) NOT NULL,
        flag_cover_fail int(11) NOT NULL,
        flag_self_cover int(11) NOT NULL,
        flag_self_cover_pass int(11) NOT NULL,
        flag_self_cover_fail int(11) NOT NULL,
        flag_multi_cover int(11) NOT NULL,
        flag_spree_cover int(11) NOT NULL,
        flag_cover_best int(11) NOT NULL,
        flag_self_cover_best int(11) NOT NULL,
        flag_kill int(11) NOT NULL,
        flag_save int(11) NOT NULL,
        flag_carry_time double NOT NULL,
        assault_objectives int(11) NOT NULL,
        dom_caps int(11) NOT NULL,
        dom_caps_best_life int(11) NOT NULL,
        ping_min int(11) NOT NULL,
        ping_average int(11) NOT NULL,
        ping_max int(11) NOT NULL,
        accuracy float NOT NULL,
        shortest_kill_distance float NOT NULL,
        average_kill_distance float NOT NULL,
        longest_kill_distance float NOT NULL,
        k_distance_normal int(11) NOT NULL,
        k_distance_long int(11) NOT NULL,
        k_distance_uber int(11) NOT NULL,
        headshots int(11) NOT NULL,
        shield_belt int(11) NOT NULL,
        amp int(11) NOT NULL,
        amp_time float NOT NULL,
        invisibility int(11) NOT NULL,
        invisibility_time float NOT NULL,
        pads int(11) NOT NULL,
        armor int(11) NOT NULL,
        boots int(11) NOT NULL,
        super_health int(11) NOT NULL,
        mh_kills int(11) NOT NULL,
        mh_kills_best_life int(11) NOT NULL,
        views int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_player_totals (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(30) NOT NULL,
        player_id int(11) NOT NULL,
        first int(11) NOT NULL,
        last int(11) NOT NULL,
        ip varchar(50) NOT NULL,
        country varchar(2) NOT NULL,
        face int(100) NOT NULL,
        voice int(11) NOT NULL,
        gametype int(11) NOT NULL,
        matches int(11) NOT NULL,
        wins int(11) NOT NULL,
        losses int(11) NOT NULL,
        draws int(11) NOT NULL,
        winrate float NOT NULL,
        playtime double NOT NULL,
        first_bloods int(11) NOT NULL,
        frags int(11) NOT NULL,
        score int(11) NOT NULL,
        kills int(11) NOT NULL,
        deaths int(11) NOT NULL,
        suicides int(11) NOT NULL,
        team_kills int(11) NOT NULL,
        spawn_kills int(11) NOT NULL,
        efficiency float NOT NULL,
        multi_1 int(11) NOT NULL,
        multi_2 int(11) NOT NULL,
        multi_3 int(11) NOT NULL,
        multi_4 int(11) NOT NULL,
        multi_5 int(11) NOT NULL,
        multi_6 int(11) NOT NULL,
        multi_7 int(11) NOT NULL,
        multi_best int(11) NOT NULL,
        spree_1 int(11) NOT NULL,
        spree_2 int(11) NOT NULL,
        spree_3 int(11) NOT NULL,
        spree_4 int(11) NOT NULL,
        spree_5 int(11) NOT NULL,
        spree_6 int(11) NOT NULL,
        spree_7 int(11) NOT NULL,
        spree_best int(11) NOT NULL,
        fastest_kill float NOT NULL,
        slowest_kill float NOT NULL,
        best_spawn_kill_spree int(11) NOT NULL,
        flag_assist int(11) NOT NULL,
        flag_return int(11) NOT NULL,
        flag_taken int(11) NOT NULL,
        flag_dropped int(11) NOT NULL,
        flag_capture int(11) NOT NULL,
        flag_pickup int(11) NOT NULL,
        flag_seal int(11) NOT NULL,
        flag_cover int(11) NOT NULL,
        flag_cover_pass int(11) NOT NULL,
        flag_cover_fail int(11) NOT NULL,
        flag_self_cover int(11) NOT NULL,
        flag_self_cover_pass int(11) NOT NULL,
        flag_self_cover_fail int(11) NOT NULL,
        flag_multi_cover int(11) NOT NULL,
        flag_spree_cover int(11) NOT NULL,
        flag_cover_best int(11) NOT NULL,
        flag_self_cover_best int(11) NOT NULL,
        flag_kill int(11) NOT NULL,
        flag_save int(11) NOT NULL,
        flag_carry_time double NOT NULL,
        assault_objectives int(11) NOT NULL,
        dom_caps int(11) NOT NULL,
        dom_caps_best int(11) NOT NULL,
        dom_caps_best_life int(11) NOT NULL,
        accuracy float NOT NULL,
        k_distance_normal int(11) NOT NULL,
        k_distance_long int(11) NOT NULL,
        k_distance_uber int(11) NOT NULL,
        headshots int(11) NOT NULL,
        shield_belt int(11) NOT NULL,
        amp int(11) NOT NULL,
        amp_time float NOT NULL,
        invisibility int(11) NOT NULL,
        invisibility_time float NOT NULL,
        pads int(11) NOT NULL,
        armor int(11) NOT NULL,
        boots int(11) NOT NULL,
        super_health int(11) NOT NULL,
        mh_kills int(11) NOT NULL,
        mh_kills_best_life int(11) NOT NULL,
        mh_kills_best int(11) NOT NULL,
        views int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_player_weapon_match (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        player_id int(11) NOT NULL,
        weapon_id int(11) NOT NULL,
        kills int(11) NOT NULL,
        deaths int(11) NOT NULL,
        accuracy float NOT NULL,
        shots int(11) NOT NULL,
        hits int(11) NOT NULL,
        damage bigint(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_player_weapon_totals (
        id int(11) NOT NULL AUTO_INCREMENT,
        player_id int(11) NOT NULL,
        gametype int(11) NOT NULL,
        weapon int(11) NOT NULL,
        kills int(11) NOT NULL,
        deaths int(11) NOT NULL,
        efficiency int(11) NOT NULL,
        accuracy float NOT NULL,
        shots int(11) NOT NULL,
        hits int(11) NOT NULL,
        damage bigint(11) NOT NULL,
        matches int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_ranking_player_current (
        id int(11) NOT NULL AUTO_INCREMENT,
        player_id int(11) NOT NULL,
        gametype int(11) NOT NULL,
        matches int(11) NOT NULL,
        playtime float NOT NULL,
        ranking Decimal(10,4) NOT NULL,
        ranking_change Decimal(10,4) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_ranking_player_history (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        player_id int(11) NOT NULL,
        gametype int(11) NOT NULL,
        ranking Decimal(10,4) NOT NULL,
        match_ranking Decimal(10,4) NOT NULL,
        ranking_change Decimal(10,4) NOT NULL,
        match_ranking_change Decimal(10,4) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_ranking_values (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(30) NOT NULL,
        display_name varchar(75) NOT NULL,
        description varchar(250) NOT NULL,
        value float NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_servers (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        ip varchar(100) NOT NULL,
        port int(5) NOT NULL,
        first int(11) NOT NULL,
        last int(11) NOT NULL,
        matches int(11) NOT NULL,
        playtime double NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_sessions (
        id int(11) NOT NULL AUTO_INCREMENT,
        date int(11) NOT NULL,
        user int(11) NOT NULL,
        hash varchar(64) NOT NULL,
        created int(11) NOT NULL,
        expires int(11) NOT NULL,
        login_ip varchar(50) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_site_settings (
        id int(11) NOT NULL AUTO_INCREMENT,
        category varchar(50) NOT NULL,
        name varchar(100) NOT NULL,
        value varchar(100) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_sprees (
        id int(11) NOT NULL AUTO_INCREMENT,
        match_id int(11) NOT NULL,
        player int(11) NOT NULL,
        kills int(11) NOT NULL,
        start_timestamp float NOT NULL,
        end_timestamp float NOT NULL,
        total_time float NOT NULL,
        killer int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_users (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(20) NOT NULL,
        password varchar(64) NOT NULL,
        joined int(11) NOT NULL,
        activated int(1) NOT NULL,
        logins int(11) NOT NULL,
        admin int(11) NOT NULL,
        last_login int(11) NOT NULL,
        last_active int(11) NOT NULL,
        last_ip varchar(50) NOT NULL,
        banned int(11) NOT NULL,
        upload_images int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_voices (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        first int(11) NOT NULL,
        last int(11) NOT NULL,
        uses int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_weapons (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        matches int(11) NOT NULL,
        kills int(11) NOT NULL,
        deaths int(11) NOT NULL,
        accuracy float NOT NULL,
        shots int(11) NOT NULL,
        hits int(11) NOT NULL,
        damage bigint(20) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_winrates (
        id int(11) NOT NULL AUTO_INCREMENT,
        date int(11) NOT NULL,
        match_id int(11) NOT NULL,
        player int(11) NOT NULL,
        gametype int(11) NOT NULL,
        match_result int(11) NOT NULL,
        matches int(11) NOT NULL,
        wins int(11) NOT NULL,
        draws int(11) NOT NULL,
        losses int(11) NOT NULL,
        winrate float NOT NULL,
        current_win_streak int(11) NOT NULL,
        current_draw_streak int(11) NOT NULL,
        current_lose_streak int(11) NOT NULL,
        max_win_streak int(11) NOT NULL,
        max_draw_streak int(11) NOT NULL,
        max_lose_streak int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS nstats_winrates_latest (
        id int(11) NOT NULL AUTO_INCREMENT,
        date int(11) NOT NULL,
        match_id int(11) NOT NULL,
        player int(11) NOT NULL,
        gametype int(11) NOT NULL,
        matches int(11) NOT NULL,
        wins int(11) NOT NULL,
        draws int(11) NOT NULL,
        losses int(11) NOT NULL,
        winrate float NOT NULL,
        current_win_streak int(11) NOT NULL,
        current_draw_streak int(11) NOT NULL,
        current_lose_streak int(11) NOT NULL,
        max_win_streak int(11) NOT NULL,
        max_draw_streak int(11) NOT NULL,
        max_lose_streak int(11) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS nstats_hits (
        id int(11) NOT NULL AUTO_INCREMENT,
        ip varchar(50) NOT NULL,
        date int(11) NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS nstats_visitors (
          id int(11) NOT NULL AUTO_INCREMENT,
          ip varchar(50) NOT NULL,
          first int(11) NOT NULL,
          last int(11) NOT NULL,
          total int(11) NOT NULL,
          PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS nstats_visitors_countries (
        id int(11) NOT NULL AUTO_INCREMENT,
        code varchar(2) NOT NULL,
        country varchar(100) NOT NULL,
        first int(11) NOT NULL,
        last int(11) NOT NULL,
        total int(11) NOT NULL,
        PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS nstats_user_agents (
          id int(11) NOT NULL AUTO_INCREMENT,
          system_name varchar(100) NOT NULL,
          browser varchar(100) NOT NULL,
          first int(11) NOT NULL,
          last int(11) NOT NULL,
          total int(11) NOT NULL,
          PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,


    `CREATE TABLE IF NOT EXISTS nstats_ace_players (
        id int(11) NOT NULL AUTO_INCREMENT,
        log_file varchar(255) NOT NULL,
        ace_version varchar(50) NOT NULL,
        timestamp int(11) NOT NULL,
        player varchar(30) NOT NULL,
        ip varchar(50) NOT NULL,
        os varchar(32) NOT NULL,
        mac1 varchar(32) NOT NULL,
        mac2 varchar(32) NOT NULL,
        hwid varchar(32) NOT NULL
      ,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,


    "INSERT INTO nstats_ranking_values VALUES(NULL,'frags','Kill','Player Killed an enemy',300)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'deaths','Death','Player died',-150)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'suicides','Suicide','Player killed themself',-150)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'team_kills','Team Kill','Player killed a team mate',-1200)",

    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_taken','Flag Grab','Player grabbed the flag from the enemy flag stand',600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_pickup','Flag Pickup','Player picked up a dropped enemy flag',600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_return','Flag Return','Player returned the players flag to their base',600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_capture','Flag Capture','Player capped the enemy flag',6000)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_seal','Flag Seal','Player sealed off the base while a team mate was carrying the flag',1200)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_assist','Flag Assist','Player had carry time of the enemy flag that was capped',3000)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_kill','Flag Kill','Player killed the enemy flag carrier.',1200)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_dropped','Flag Dropped','Player dropped the enemy flag',-300)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_cover','Flag Cover','Player killed an enemy close to a team mate carrying the flag',1800)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_cover_pass','Flag Successful Cover','Player covered the flag carrier that was later capped',1000)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_cover_fail','Flag Failed Cover','Player covered the flag carrier but the flag was returned',-600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_self_cover','Flag Self Cover','Player killed an enemy while carrying the flag',600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_self_cover_pass','Successful Flag Self Cover','Player killed an enemy while carrying the flag that was later capped',1000)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_self_cover_fail','Failed Flag Self Cover','Player killed an enemy while carrying the flag, but the flag was returned',-600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_multi_cover','Flag Multi Cover','Player covered the flag carrier 3 times while the enemy flag was taken one time',3600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_spree_cover','Flag Cover Spree','Player covered the flag carrier 4 or more times while the enemy flag was taken one time',4200)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'flag_save','Flag Close Save','Player returned their flag that was close to being capped by the enemy team',4000)",


    "INSERT INTO nstats_ranking_values VALUES(NULL,'dom_caps','Domination Control Point Caps','Player captured a contol point.',6000)",

    "INSERT INTO nstats_ranking_values VALUES(NULL,'assault_objectives','Assault Objectives','Player captured an assault objective.',6000)",

    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_1','Double Kill','Player killed 2 people in a short amount of time without dying',100)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_2','Multi Kill','Player killed 3 people in a short amount of time without dying',150)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_3','Mega Kill','Player killed 4 people in a short amount of time without dying',200)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_4','Ultra Kill','Player killed 5 people in a short amount of time without dying',300)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_5','Monster Kill','Player killed 6 people in a short amount of time without dying',450)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_6','Ludicrous Kill','Player killed 7 people in a short amount of time without dying',600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'multi_7','Holy Shit','Player killed 8 or more people in a short amount of time without dying',750)",

    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_1','Killing Spree','Player killed 5 to 9 players in one life',600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_2','Rampage','Player killed 10 to 14 players in one life',750)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_3','Dominating','Player killed 15 to 19 players in one life',900)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_4','Unstoppable','Player killed 20 to 24 players in one life',1200)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_5','Godlike','Player killed 25 to 29 players in one life',1800)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_6','Too Easy','Player killed 30 to 34 players in one life',2400)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'spree_7','Brutalizing the competition','Player killed 35 or more players in one life',3600)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'mh_kills','Monster Kills(MonsterHunt)','Player killed a monster',360)",


    `INSERT INTO nstats_ranking_values
     VALUES(
         NULL,
         'sub_half_hour_multiplier',
         'Sub 30 Minutes Playtime Penalty',
         'Reduce the player\\'s score to a percentage of it\\'s original value',
          0.05)`,
    
    
    "INSERT INTO nstats_ranking_values VALUES(NULL,'sub_hour_multiplier','Sub 1 Hour Playtime Penalty Multiplier','Reduce the player\\'s score to a percentage of it\\'s original value', 0.2)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'sub_2hour_multiplier','Sub 2 Hour Playtime Penalty Multiplier','Reduce the player\\'s score to a percentage of it\\'s original value', 0.5)",
    "INSERT INTO nstats_ranking_values VALUES(NULL,'sub_3hour_multiplier','Sub 3 Hour Playtime Penalty Multiplier','Reduce the player\\'s score to a percentage of it\\'s original value', 0.75)",
    `INSERT INTO nstats_items VALUES(NULL,"AntiGrav Boots","Jump Boots",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"Body Armor","Body Armor",0,0,0,0,3)`,
    `INSERT INTO nstats_items VALUES(NULL,"Chainsaw","Chainsaw",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Damage Amplifier","Damage Amplifier",0,0,0,0,4)`,
    `INSERT INTO nstats_items VALUES(NULL,"Double Enforcers","Double Enforcers",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Enforcer","Enforcer",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Enhanced Shock Rifle","Enhanced Shock Rifle",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Flak Cannon","Flak Cannon",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"GES Bio Rifle","GES Bio Rifle",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Health Pack","Health Pack",0,0,0,0,3)`,
    `INSERT INTO nstats_items VALUES(NULL,"Health Vial","Health Vial",0,0,0,0,3)`,
    `INSERT INTO nstats_items VALUES(NULL,"Invisibility","Invisibility",0,0,0,0,4)`,
    `INSERT INTO nstats_items VALUES(NULL,"Minigun","Minigun",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Pulse Gun","Pulse Gun",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Redeemer","Redeemer",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"RelicDeathInventory","Relic Death",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"RelicDefenseInventory","Relic Defense",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"RelicRedemptionInventory","Relic Redemption",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"RelicRegenInventory","Relic Regen",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"RelicSpeedInventory","Relic Speed",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"RelicStrengthInventory","Relic Strength",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"Ripper","Ripper",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Rocket Launcher","Rocket Launcher",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Shield Belt","Shield Belt",0,0,0,0,4)`,
    `INSERT INTO nstats_items VALUES(NULL,"Shock Rifle","Shock Rifle",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Sniper Rifle","Sniper Rifle",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Super Health Pack","Super Health Pack",0,0,0,0,3)`,
    `INSERT INTO nstats_items VALUES(NULL,"Thigh Pads","Thigh Pads",0,0,0,0,3)`,
    `INSERT INTO nstats_items VALUES(NULL,"Ammor Percing Slugs Pads","Armor Percing Slugs",0,0,0,0,2)`,
    `INSERT INTO nstats_items VALUES(NULL,"AP CAS12","AP CAS12s",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Armor Shard","Armor Shard",0,0,0,0,3)`,
    `INSERT INTO nstats_items VALUES(NULL,"Arrows","Arrows",0,0,0,0,2)`,
    `INSERT INTO nstats_items VALUES(NULL,"Blade Hopper","Ripper Ammo",0,0,0,0,2)`,
    `INSERT INTO nstats_items VALUES(NULL,"Box of Rifle Rounds","Sniper Ammo",0,0,0,0,2)`,
    `INSERT INTO nstats_items VALUES(NULL,"Box of RPB Rounds","RPB Sniper Ammo",0,0,0,0,2)`,
    `INSERT INTO nstats_items VALUES(NULL,"CAS12","CAS12",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Chaos Sniper Rifle","Chaos Sniper Rifle",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Claw","Claw",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Crossbow","Crossbow",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Explosive Arrows","Crossbow",0,0,0,0,2)`,
    `INSERT INTO nstats_items VALUES(NULL,"Explosive CAS12","Explosive CAS12",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Explosive Crossbow","Explosive Crossbow",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Explosive SG Shells","Explosive SG Shells",0,0,0,0,2)`,
    `INSERT INTO nstats_items VALUES(NULL,"Flak Shells","Flak Shells",0,0,0,0,2)`,
    `INSERT INTO nstats_items VALUES(NULL,"Gravity Belt","Gravity Belt",0,0,0,0,5)`,
    `INSERT INTO nstats_items VALUES(NULL,"Poison Crossbow","Poison Crossbow",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Proxy Mines","Proxy Mines",0,0,0,0,1)`,
    `INSERT INTO nstats_items VALUES(NULL,"Rocket Pack","Rocket Pack",0,0,0,0,2)`,
    `INSERT INTO nstats_items VALUES(NULL,"SG Shells","SG Shell",0,0,0,0,2)`,
    `INSERT INTO nstats_items VALUES(NULL,"Shock Core","Shock Core",0,0,0,0,2)`,
    `INSERT INTO nstats_items VALUES(NULL,"Sword","Sword",0,0,0,0,1)`,


    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Addicted Players","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Most Played Gametypes","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Most Played Maps","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Most Popular Countries","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Most Used Faces","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Recent Matches","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Recent Matches & Player Stats","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Recent Players","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Display Latest Match","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Recent Matches Display Type","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Home","Recent Matches To Display","3")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Addicted Players","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Control Points (Domination)","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Games Played","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Longest Matches","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Map Objectives (Assault)","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Recent Matches","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Spawn Points","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Display Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Max Addicted Players","5")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Max Longest Matches","5")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Map Pages","Recent Matches Per Page","50")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Maps Page","Default Display Per Page","25")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Maps Page","Default Display Type","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Assault Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Capture The Flag Caps","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Capture The Flag Graphs","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Capture The Flag Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Domination Graphs","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Domination Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Frag Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Frags Graphs","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Kills Match Up","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Match Report Title","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Pickup Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Player Ping Graph","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Players Connected to Server Graph","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Powerup Control","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Rankings","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Screenshot","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Server Settings","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Special Events","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Extended Sprees","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Team Changes","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Match Pages","Display Weapon Statistics","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Default Display Per Page","25")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Default Display Type","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Matches Page","Default Gametype","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Admin","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Home","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Login/Logout","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Maps","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Matches","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Players","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Rankings","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Navigation","Display Records","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Default Recent Matches Display","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Default Weapon Display","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Assault & Domination","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Capture The Flag Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Frag Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Gametype Stats","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Pickup History","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Ping History Graph","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Rankings","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Recent Activity Graph","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Recent Matches","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Special Events","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Summary","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Display Weapon Stats","true")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Player Pages","Recent Matches Per Page","25")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Players Page","Default Display Per Page","25")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Players Page","Default Display Type","0")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Players Page","Default Order","ASC")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Players Page","Default Sort Type","name")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Rankings","Rankings Per Gametype (Main)","10")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Rankings","Rankings Per Page (Individual)","100")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Records Page","Default Per Page","25")`,
    `INSERT INTO nstats_site_settings VALUES(NULL,"Records Page","Default Record Type","0")`

];


(async () =>{


    const basicQuery = (query) =>{

        return new Promise((resolve, reject) =>{

            mysql.query(query, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }   

    try{
        
        for(let i = 0; i < queries.length; i++){

            
            await basicQuery(queries[i]);

            if(i === 0){
                mysql.end();
                mysql = mysqlObject.createPool({
                    "host": config.mysql.host,
                    "user": config.mysql.user,
                    "password": config.mysql.password,
                    "database": config.mysql.database
                });
            }
            new Message(`Performed query ${i+1} of ${queries.length}`,"pass");
        
        }

        mysql.end();

        const seed = Functions.generateRandomString(10000);


        const fileContents = `module.exports = () => {  return \`${seed}\`;}`;

        fs.writeFileSync("./salt.js", fileContents);

        process.exit();

    }catch(err){
        console.trace(err);
    }
})();

