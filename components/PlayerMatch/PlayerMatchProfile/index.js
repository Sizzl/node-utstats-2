import styles from "./PlayerMatchProfile.module.css";
import Link from 'next/link';
import Image from "next/image";

const PlayerMatchProfile = ({host, data, matchId, playerId}) =>{

    console.log(data);

    if(data.country === "") data.country = "xx";

    return <div>
        <Link href={`/player/${playerId}`}>
            <a>
                <div className={`${styles.wrapper} center m-bottom-10`}>
            
                    Click to View <Image className={styles.flag} height={14} width={22} src={`/images/flags/${data.country.toLowerCase()}.svg`} alt="flag"/> 
                    <b> {data.name}{(data.name[data.name.length - 1] == "s") ? "'" : "'s"}</b> Career Profile.
                
                </div>
            </a>
        </Link>

        <Link href={`/match/${matchId}`}>
            <a>
                <div className={`${styles.wrapper} center m-bottom-10`}>
            
                    Click to View Full Match Report
                
                </div>
            </a>
        </Link>
    </div>
}

export default PlayerMatchProfile;