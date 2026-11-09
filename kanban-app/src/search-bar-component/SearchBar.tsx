interface SearchBarProps{
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

function SearchBar({searchQuery, setSearchQuery}: SearchBarProps){
    return(
        <div style={{"height": "100%"}}>
            <input
                type="search"
                aria-label="Search tasks"
                placeholder="Title, priority, or label"
                style={{"padding":"10px"}}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
            />
        </div>
    );
}

export default SearchBar;
