import Countires from '../../api/countries';

const CountryFlag = ({country}) =>{

    let flag = Countires(country);

    return (<img className="country-flag" src={`/images/flags/${flag.code}.svg`} alt="flag"/>);
}


export default CountryFlag;