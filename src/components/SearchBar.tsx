import { useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
interface Props { onSearch:(query:string)=>void; isLoading:boolean; }
export default function SearchBar({onSearch,isLoading}:Props) {
  const [query,setQuery] = useState('');
  function submit(value:string){if(!isLoading && value.trim()){setQuery(value);onSearch(value.trim());}}
  return <div className="activity-search">
    <form onSubmit={e=>{e.preventDefault();submit(query);}}>
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="What are you curious about? Try playing the piano…" aria-label="Describe an activity" disabled={isLoading} maxLength={500}/>
      <button type="submit" disabled={isLoading || !query.trim()} aria-label="Explore activity">{isLoading?<Loader2 size={19} className="animate-spin"/>:<ArrowUp size={20}/>}</button>
    </form>
    <div className="suggestions"><span>Try a little wonder</span>{['Playing the piano','Remembering a face','Learning to dance'].map(s=><button key={s} disabled={isLoading} onClick={()=>submit(s)}>{s}<span aria-hidden="true">↗</span></button>)}</div>
  </div>;
}
